import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login",    loginUser);

// quick "who am I" — returns the user attached by protect middleware
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

export default router;
