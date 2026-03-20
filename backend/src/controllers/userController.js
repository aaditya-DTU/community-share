import User from "../models/User.js";
import Item from "../models/Item.js";
import BorrowRequest from "../models/BorrowRequest.js";
import Review from "../models/Review.js";
 
/**
 * @desc    Get logged-in user's full profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
 
    const [user, myItems, borrowedItems, incomingRequests, reviews] =
      await Promise.all([
        User.findById(userId).select("-password -__v").lean(),
 
        Item.find({ owner: userId })
          .select("title category isAvailable condition createdAt")
          .sort({ createdAt: -1 })
          .lean(),
 
        BorrowRequest.find({ borrower: userId, status: { $in: ["approved", "returned"] } })
          .populate("item", "title category")
          .select("status approvedAt returnedAt item")
          .sort({ createdAt: -1 })
          .lean(),
 
        BorrowRequest.find({ owner: userId, status: "pending" })
          .populate("borrower", "name trustScore")
          .populate("item", "title")
          .select("status message requestedAt item borrower")
          .sort({ requestedAt: -1 })
          .lean(),
 
        Review.find({ reviewee: userId })
          .populate("reviewer", "name")
          .select("rating comment createdAt reviewer")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);
 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
 
    res.json({
      user,
      myItems,
      borrowedItems,
      incomingRequests,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};
 
/**
 * @desc    Update logged-in user's profile (name only — email/password handled separately)
 * @route   PATCH /api/users/me
 * @access  Private
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
 
    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
 
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true, select: "-password -__v" }
    );
 
    res.json(user);
  } catch (err) {
    next(err);
  }
};
 
/**
 * @desc    Get public profile of any user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name trustScore averageRating reviewCount totalBorrows totalLends createdAt")
      .lean();
 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
 
    const [itemCount, reviews] = await Promise.all([
      Item.countDocuments({ owner: user._id, isAvailable: true }),
      Review.find({ reviewee: user._id })
        .populate("reviewer", "name")
        .select("rating comment createdAt reviewer")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);
 
    res.json({ user, availableItems: itemCount, reviews });
  } catch (err) {
    next(err);
  }
};
 
/**
 * @desc    Dashboard summary (kept for backwards compat)
 * @route   GET /api/users/dashboard
 * @access  Private
 */
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
 
    const [listedItems, borrowedItems, incomingRequests, outgoingRequests] =
      await Promise.all([
        Item.countDocuments({ owner: userId }),
        BorrowRequest.countDocuments({ borrower: userId, status: "approved" }),
        BorrowRequest.countDocuments({ owner: userId,   status: "pending"  }),
        BorrowRequest.countDocuments({ borrower: userId, status: "pending" }),
      ]);
 
    res.json({
      listedItems,
      borrowedItems,
      incomingRequests,
      outgoingRequests,
      trustScore: req.user.trustScore,
    });
  } catch (err) {
    next(err);
  }
};
 
/**
 * @desc    Update logged-in user's location
 * @route   PATCH /api/users/me/location
 * @access  Private
 */
export const updateMyLocation = async (req, res, next) => {
  try {
    const { longitude, latitude } = req.body;
 
    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({ message: "Longitude and latitude are required" });
    }
 
    const lng = Number(longitude);
    const lat = Number(latitude);
 
    if (isNaN(lng) || isNaN(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }
 
    await User.findByIdAndUpdate(req.user._id, {
      location: { type: "Point", coordinates: [lng, lat] },
    });
 
    res.json({ message: "Location updated" });
  } catch (err) {
    next(err);
  }
};