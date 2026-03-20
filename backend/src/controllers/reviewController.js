import Review from "../models/Review.js";
import BorrowRequest from "../models/BorrowRequest.js";
import User from "../models/User.js";
import calculateTrustScore from "../utils/calculateTrustScore.js";
import createNotification, { NOTIF_TYPES } from "../utils/createNotification.js";

/**
 * @desc    Submit a review after a completed borrow
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = async (req, res, next) => {
  try {
    const { requestId, rating, comment } = req.body;

    if (!requestId || !rating) {
      return res.status(400).json({ message: "Request ID and rating are required" });
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const request = await BorrowRequest.findById(requestId)
      .populate("item", "title");

    if (!request) {
      return res.status(404).json({ message: "Borrow request not found" });
    }

    if (request.status !== "returned") {
      return res.status(400).json({ message: "Reviews can only be submitted after an item has been returned" });
    }

    const isBorrower = req.user._id.toString() === request.borrower.toString();
    const isOwner    = req.user._id.toString() === request.owner.toString();

    if (!isBorrower && !isOwner) {
      return res.status(403).json({ message: "Not authorized to review this request" });
    }

    // Check if this specific party already reviewed
    if (isBorrower && request.borrowerReviewed) {
      return res.status(400).json({ message: "You have already reviewed this request" });
    }
    if (isOwner && request.ownerReviewed) {
      return res.status(400).json({ message: "You have already reviewed this request" });
    }

    // reviewee is the other party
    const revieweeId = isBorrower ? request.owner : request.borrower;

    // prevent duplicate at DB level
    const existing = await Review.findOne({ request: requestId, reviewer: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this request" });
    }

    const review = await Review.create({
      request:  requestId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating:   parsedRating,
      comment:  comment?.trim(),
    });

    // Mark which party reviewed — independently
    if (isBorrower) request.borrowerReviewed = true;
    if (isOwner)    request.ownerReviewed    = true;

    // Mark legacy isReviewed only when BOTH have reviewed
    if (request.borrowerReviewed && request.ownerReviewed) {
      request.isReviewed = true;
    }

    await request.save();

    // Recalculate reviewee trust score
    const reviewee = await User.findById(revieweeId);
    if (reviewee) {
      reviewee.trustScore = calculateTrustScore(reviewee);
      await reviewee.save();
    }

    // Notify reviewee
    const roleLabel = isBorrower ? "borrower" : "owner";
    await createNotification({
      user:           revieweeId,
      type:           NOTIF_TYPES.REVIEW_RECEIVED,
      message:        `${req.user.name} left you a ${parsedRating}⭐ review`,
      relatedRequest: requestId,
    });

    res.status(201).json({
      review,
      borrowerReviewed: request.borrowerReviewed,
      ownerReviewed:    request.ownerReviewed,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this request" });
    }
    next(err);
  }
};

/**
 * @desc    Get all reviews for a user
 * @route   GET /api/reviews/user/:userId
 * @access  Private
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name trustScore")
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);
  } catch (err) {
    next(err);
  }
};