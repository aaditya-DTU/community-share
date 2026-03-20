import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createReview, getUserReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/",             protect, createReview);

// get all reviews for a specific user (for profile page)
router.get("/user/:userId",  protect, getUserReviews);

export default router;
