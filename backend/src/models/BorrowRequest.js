import mongoose from "mongoose";

const borrowRequestSchema = new mongoose.Schema(
  {
    item: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Item",
      required: [true, "Item reference is required"],
    },

    borrower: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Borrower reference is required"],
    },

    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Owner reference is required"],
    },

    status: {
      type:    String,
      enum:    ["pending", "approved", "rejected", "returned"],
      default: "pending",
    },

    message: {
      type:      String,
      trim:      true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },

    // Track reviews independently per party
    borrowerReviewed: { type: Boolean, default: false }, // borrower reviewed the owner
    ownerReviewed:    { type: Boolean, default: false }, // owner reviewed the borrower

    // Legacy field — kept for backward compat, true when BOTH have reviewed
    isReviewed: { type: Boolean, default: false },

    requestedAt:  { type: Date, default: Date.now },
    approvedAt:   { type: Date },
    respondedAt:  { type: Date },
    returnedAt:   { type: Date },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────
borrowRequestSchema.index({ borrower: 1, status: 1 });
borrowRequestSchema.index({ owner: 1,   status: 1 });
borrowRequestSchema.index({ item: 1,    status: 1 });

export default mongoose.model("BorrowRequest", borrowRequestSchema);