import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// ── Shared response shape ─────────────────────────────────────
const userResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  trustScore: user.trustScore,
  role: user.role,
  token,
});

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // duplicate check
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    res.status(201).json(userResponse(user, generateToken(user._id)));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // explicitly select password (it's select:false on model)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    // single vague message — don't reveal which field is wrong
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated" });
    }

    res.json(userResponse(user, generateToken(user._id)));
  } catch (err) {
    next(err);
  }
};
