import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

dotenv.config();

// ── Validate required env vars ────────────────────────────────
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const PORT     = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ── MongoDB connection ────────────────────────────────────────
mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// ── Start server ──────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${NODE_ENV}]`);
  });

  // ── Graceful shutdown ───────────────────────────────────────
  const shutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed");
      console.log("👋 Server shut down");
      process.exit(0);
    });

    // Force exit after 10s if still hanging
    setTimeout(() => {
      console.error("❌ Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));

  // ── Unhandled rejections ────────────────────────────────────
  process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Promise Rejection:", reason);
    shutdown("unhandledRejection");
  });

  process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err.message);
    shutdown("uncaughtException");
  });
};

startServer();
