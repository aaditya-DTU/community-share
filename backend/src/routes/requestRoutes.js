import express from "express";
import {
  createBorrowRequest,
  approveRequest,
  rejectRequest,
  returnItem,
  getOwnerRequests,
  getMyRequests,
  getBorrowedItems,
} from "../controllers/requestController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// all routes are protected
router.post("/",                protect, createBorrowRequest);

// named collection routes BEFORE /:id
router.get("/my-requests",      protect, getMyRequests);
router.get("/incoming",         protect, getOwnerRequests);
router.get("/borrowed",         protect, getBorrowedItems);

// legacy aliases (kept for backward compatibility)
router.get("/my",               protect, getMyRequests);
router.get("/owner",            protect, getOwnerRequests);

// per-request actions
router.patch("/:id/approve",    protect, approveRequest);
router.patch("/:id/reject",     protect, rejectRequest);
router.patch("/:id/return",     protect, returnItem);

export default router;
