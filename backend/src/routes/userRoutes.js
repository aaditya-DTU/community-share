import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getMyProfile,
  updateMyProfile,
  updateMyLocation,
  getUserById,
  getDashboard,
} from "../controllers/userController.js";
 
const router = express.Router();
 
router.get("/me",           protect, getMyProfile);
router.patch("/me",         protect, updateMyProfile);
router.patch("/me/location",protect, updateMyLocation);
router.get("/dashboard",    protect, getDashboard);
router.get("/:id",          protect, getUserById);
 
export default router;