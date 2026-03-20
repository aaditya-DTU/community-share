import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * @desc  Protect routes — verifies JWT and attaches req.user
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized — no token provided" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message = err.name === "TokenExpiredError"
        ? "Session expired — please log in again"
        : "Not authorized — invalid token";
      return res.status(401).json({ message });
    }

    // fetch user (exclude password), attach to request
    const user = await User.findById(decoded.id).select("-password -__v").lean();

    if (!user) {
      return res.status(401).json({ message: "Not authorized — user no longer exists" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated" });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Admin-only guard — must be used after protect
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
