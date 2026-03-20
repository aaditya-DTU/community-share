import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

import authRoutes         from "./routes/authRoutes.js";
import itemRoutes         from "./routes/itemRoutes.js";
import requestRoutes      from "./routes/requestRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes       from "./routes/reviewRoutes.js";
import userRoutes         from "./routes/userRoutes.js";
import dashboardRoutes    from "./routes/dashboardRoutes.js";
import errorHandler       from "./middlewares/errorMiddleware.js";

const app = express();

// ── Security headers ─────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));         // prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── NoSQL injection sanitization ─────────────────────────────
// app.use(mongoSanitize());

// ── Global rate limiter ──────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});
app.use("/api", globalLimiter);

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
});

// ── Dev request logger ───────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── Health check ─────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status:  "ok",
    message: "Community Share API is running",
    version: "1.0.0",
    env:     process.env.NODE_ENV || "development",
  });
});

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth",          authLimiter, authRoutes);
app.use("/api/items",         itemRoutes);
app.use("/api/requests",      requestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews",       reviewRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/dashboard",     dashboardRoutes);

// ── 404 handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global error handler ─────────────────────────────────────
app.use(errorHandler);

export default app;
