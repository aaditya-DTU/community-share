import mongoose from "mongoose";
import BorrowRequest from "../models/BorrowRequest.js";
import Item from "../models/Item.js";
import User from "../models/User.js";
import createNotification, { NOTIF_TYPES } from "../utils/createNotification.js";
import calculateTrustScore from "../utils/calculateTrustScore.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * @desc    Create borrow request
 * @route   POST /api/requests
 * @access  Private
 */
export const createBorrowRequest = async (req, res, next) => {
  try {
    const { itemId, message } = req.body;
    const borrowerId = req.user._id;

    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    const item = await Item.findById(itemId).populate("owner", "name email");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.owner._id.toString() === borrowerId.toString()) {
      return res.status(400).json({ message: "You cannot borrow your own item" });
    }

    if (!item.isAvailable) {
      return res.status(400).json({ message: "This item is currently unavailable" });
    }

    // prevent duplicate pending request from same borrower
    const existing = await BorrowRequest.findOne({
      item: itemId, borrower: borrowerId, status: "pending",
    });
    if (existing) {
      return res.status(400).json({ message: "You already have a pending request for this item" });
    }

    const request = await BorrowRequest.create({
      item:     item._id,
      borrower: borrowerId,
      owner:    item.owner._id,
      message:  message?.trim(),
    });

    // notify owner
    await createNotification({
      user:           item.owner._id,
      type:           NOTIF_TYPES.REQUEST_RECEIVED,
      message:        `${req.user.name} wants to borrow "${item.title}"`,
      relatedRequest: request._id,
    });

    // optional email to owner
    await sendEmail({
      to:       item.owner.email,
      template: "request_received",
      data:     { itemTitle: item.title, requesterName: req.user.name },
    });

    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Approve borrow request (transaction-safe)
 * @route   PATCH /api/requests/:id/approve
 * @access  Private (owner only)
 */
export const approveRequest = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const request = await BorrowRequest.findById(req.params.id)
      .populate("item")
      .session(session);

    if (!request)                        throw Object.assign(new Error("Request not found"),       { status: 404 });
    if (request.status !== "pending")    throw Object.assign(new Error("Request already processed"), { status: 400 });
    if (!request.item)                   throw Object.assign(new Error("Associated item not found"), { status: 404 });

    if (request.item.owner.toString() !== req.user._id.toString()) {
      throw Object.assign(new Error("Not authorized to approve this request"), { status: 403 });
    }

    if (!request.item.isAvailable) {
      throw Object.assign(new Error("Item is no longer available"), { status: 400 });
    }

    // approve + timestamp
    request.status      = "approved";
    request.respondedAt = new Date();
    request.approvedAt  = new Date();
    await request.save({ session });

    // mark item unavailable
    await Item.findByIdAndUpdate(
      request.item._id,
      { isAvailable: false },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // post-commit side effects
    await createNotification({
      user:           request.borrower,
      type:           NOTIF_TYPES.REQUEST_APPROVED,
      message:        `Your request for "${request.item.title}" was approved`,
      relatedRequest: request._id,
    });

    await sendEmail({
      to:       req.user.email,
      template: "request_approved",
      data:     { itemTitle: request.item.title, ownerName: req.user.name },
    });

    res.json({ message: "Request approved" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

/**
 * @desc    Reject borrow request
 * @route   PATCH /api/requests/:id/reject
 * @access  Private (owner only)
 */
export const rejectRequest = async (req, res, next) => {
  try {
    // populate item so we have the title for notification (fixes original bug)
    const request = await BorrowRequest.findById(req.params.id)
      .populate("item", "title owner");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to reject this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Cannot reject a request that is already '${request.status}'`,
      });
    }

    request.status      = "rejected";
    request.respondedAt = new Date();
    await request.save();

    await createNotification({
      user:           request.borrower,
      type:           NOTIF_TYPES.REQUEST_REJECTED,
      message:        `Your request for "${request.item.title}" was declined`,
      relatedRequest: request._id,
    });

    res.json({ message: "Request rejected" });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark item as returned (transaction-safe)
 * @route   PATCH /api/requests/:id/return
 * @access  Private (borrower only)
 */
export const returnItem = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const request = await BorrowRequest.findById(req.params.id)
      .populate("item")
      .session(session);

    if (!request) throw Object.assign(new Error("Request not found"), { status: 404 });

    if (request.borrower.toString() !== req.user._id.toString()) {
      throw Object.assign(new Error("Only the borrower can return an item"), { status: 403 });
    }

    if (request.status !== "approved") {
      throw Object.assign(new Error("Only approved requests can be returned"), { status: 400 });
    }

    const item = await Item.findById(request.item._id).session(session);
    if (!item) throw Object.assign(new Error("Item not found"), { status: 404 });

    // update request
    request.status     = "returned";
    request.returnedAt = new Date();
    await request.save({ session });

    // make item available again + increment totalBorrows
    item.isAvailable  = true;
    item.totalBorrows += 1;
    await item.save({ session });

    // update borrower stats
    const borrower = await User.findById(request.borrower).session(session);
    borrower.totalBorrows += 1;
    borrower.trustScore    = calculateTrustScore(borrower);
    await borrower.save({ session });

    // update owner stats
    const owner = await User.findById(request.owner).session(session);
    owner.totalLends += 1;
    owner.trustScore  = calculateTrustScore(owner);
    await owner.save({ session });

    await session.commitTransaction();
    session.endSession();

    // post-commit notifications
    await createNotification({
      user:           request.owner,
      type:           NOTIF_TYPES.ITEM_RETURNED,
      message:        `"${item.title}" has been returned`,
      relatedRequest: request._id,
    });

    await sendEmail({
      to:       owner.email,
      template: "item_returned",
      data:     { itemTitle: item.title, borrowerName: borrower.name },
    });

    res.json({ message: "Item returned successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

/**
 * @desc    Get incoming requests for item owner
 * @route   GET /api/requests/incoming
 * @access  Private
 */
export const getOwnerRequests = async (req, res, next) => {
  try {
    const requests = await BorrowRequest.find({ owner: req.user._id })
      .populate("item",     "title category isAvailable")
      .populate("borrower", "name trustScore averageRating")
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    res.json(requests);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get borrow requests made by logged-in user
 * @route   GET /api/requests/my-requests
 * @access  Private
 */
export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await BorrowRequest.find({ borrower: req.user._id })
      .populate("item",  "title category isAvailable")
      .populate("owner", "name trustScore")
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    res.json(requests);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get borrowed items (approved + returned) for logged-in borrower
 * @route   GET /api/requests/borrowed
 * @access  Private
 */
export const getBorrowedItems = async (req, res, next) => {
  try {
    const requests = await BorrowRequest.find({
      borrower: req.user._id,
      status:   { $in: ["approved", "returned"] },
    })
      .populate("item",  "title category")
      .populate("owner", "name")
      .select("-__v")
      .sort({ approvedAt: -1 })
      .lean();

    res.json(requests);
  } catch (err) {
    next(err);
  }
};
