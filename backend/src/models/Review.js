import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    request: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "BorrowRequest",
      required: [true, "Review must be linked to a borrow request"],
    },

    reviewer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Reviewer is required"],
    },

    reviewee: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Reviewee is required"],
    },

    rating: {
      type:     Number,
      required: [true, "Rating is required"],
      min:      [1, "Rating must be at least 1"],
      max:      [5, "Rating cannot exceed 5"],
    },

    comment: {
      type:      String,
      trim:      true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────
// One review per request per reviewer (prevents duplicates at DB level)
reviewSchema.index(
  { request: 1, reviewer: 1 },
  { unique: true, name: "one_review_per_request_per_reviewer" }
);
// Fetch all reviews for a user (their profile page)
reviewSchema.index({ reviewee: 1, createdAt: -1 });
// Fetch all reviews written by a user
reviewSchema.index({ reviewer: 1 });

// ── Post-save: update reviewee's averageRating + reviewCount ──
reviewSchema.post("save", async function () {
  try {
    const User = mongoose.model("User");

    const stats = await mongoose.model("Review").aggregate([
      { $match: { reviewee: this.reviewee } },
      {
        $group: {
          _id:           "$reviewee",
          averageRating: { $avg: "$rating" },
          reviewCount:   { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      const { averageRating, reviewCount } = stats[0];
      await User.findByIdAndUpdate(this.reviewee, {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount,
      });
    }
  } catch (err) {
    console.error("[Review post-save] Failed to update user rating:", err.message);
  }
});

export default mongoose.model("Review", reviewSchema);
