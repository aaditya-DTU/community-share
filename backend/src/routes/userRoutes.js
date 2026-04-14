import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getMyProfile,
  updateMyProfile,
  updateMyLocation,
  updateAvatar,
  getUserById,
  getDashboard,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me",            protect, getMyProfile);
router.patch("/me",          protect, updateMyProfile);
router.patch("/me/location", protect, updateMyLocation);
router.post("/me/avatar",    protect, updateAvatar);   // ← new
router.get("/dashboard",     protect, getDashboard);
router.get("/:id",           protect, getUserById);

export default router;