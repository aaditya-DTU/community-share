import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Notification must belong to a user"],
    },

    type: {
      type:     String,
      enum:     {
        values: [
          "request_received",
          "request_approved",
          "request_rejected",
          "item_returned",
          "review_received",
          // legacy values kept for backward compatibility
          "request",
          "approved",
          "rejected",
          "returned",
        ],
        message: "Invalid notification type",
      },
      required: [true, "Notification type is required"],
    },

    message: {
      type:      String,
      required:  [true, "Notification message is required"],
      trim:      true,
      maxlength: [300, "Message cannot exceed 300 characters"],
    },

    isRead: {
      type:    Boolean,
      default: false,
    },

    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "BorrowRequest",
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────
// Fast lookup of a user's notifications, newest first
notificationSchema.index({ user: 1, createdAt: -1 });
// Fast unread count query
notificationSchema.index({ user: 1, isRead: 1 });
// TTL — auto-delete notifications older than 60 days
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 24 * 60 * 60 } // 60 days
);

export default mongoose.model("Notification", notificationSchema);
