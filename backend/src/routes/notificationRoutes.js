import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markOneAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// all notification routes are private
router.get("/",              protect, getNotifications);
router.get("/unread-count",  protect, getUnreadCount);

// named routes BEFORE /:id
router.patch("/read-all",    protect, markAllAsRead);

// per-notification actions
router.patch("/:id/read",    protect, markOneAsRead);
router.delete("/:id",        protect, deleteNotification);

export default router;
