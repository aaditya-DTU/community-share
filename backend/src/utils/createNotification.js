import Notification from "../models/Notification.js";

// ── Notification type constants ───────────────────────────────
// Import these in controllers instead of using raw strings
export const NOTIF_TYPES = {
  REQUEST_RECEIVED:  "request_received",
  REQUEST_APPROVED:  "request_approved",
  REQUEST_REJECTED:  "request_rejected",
  ITEM_RETURNED:     "item_returned",
  REVIEW_RECEIVED:   "review_received",
};

/**
 * Create a notification safely.
 * Never throws — notification failure should never crash a request.
 *
 * @param {Object} options
 * @param {string} options.user            - Recipient user ID
 * @param {string} options.type            - Notification type (use NOTIF_TYPES)
 * @param {string} options.message         - Human-readable message
 * @param {string} [options.relatedRequest] - Optional linked BorrowRequest ID
 */
const createNotification = async ({ user, type, message, relatedRequest }) => {
  try {
    if (!user || !type || !message) {
      console.warn("[createNotification] Missing required fields — skipped");
      return null;
    }

    const notif = await Notification.create({
      user,
      type,
      message,
      ...(relatedRequest && { relatedRequest }),
    });

    return notif;
  } catch (err) {
    // Log but never propagate — notification failure is non-critical
    console.error("[createNotification] Failed to create notification:", err.message);
    return null;
  }
};

export default createNotification;
