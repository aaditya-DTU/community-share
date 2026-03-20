import Item from "../models/Item.js";
import BorrowRequest from "../models/BorrowRequest.js";
import Review from "../models/Review.js";

/**
 * @desc    Get dashboard stats for logged-in user
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      myItems,
      availableItems,
      borrowed,
      incomingRequests,
      myRequests,
      reviewsReceived,
    ] = await Promise.all([
      // total items listed
      Item.countDocuments({ owner: userId }),

      // items currently available
      Item.countDocuments({ owner: userId, isAvailable: true }),

      // items currently borrowed by this user
      BorrowRequest.countDocuments({ borrower: userId, status: "approved" }),

      // pending requests on user's items
      BorrowRequest.countDocuments({ owner: userId, status: "pending" }),

      // all requests ever made by this user
      BorrowRequest.countDocuments({ borrower: userId }),

      // reviews received
      Review.countDocuments({ reviewee: userId }),
    ]);

    res.json({
      myItems,
      availableItems,
      borrowed,
      incomingRequests,
      myRequests,
      reviewsReceived,
      trustScore:    req.user.trustScore,
      averageRating: req.user.averageRating,
    });
  } catch (err) {
    next(err);
  }
};
