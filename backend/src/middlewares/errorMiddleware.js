/**
 * Global error handler middleware.
 * Must be last middleware registered in app.js.
 */
const errorHandler = (err, req, res, _next) => {
  // Log in development only
  if (process.env.NODE_ENV !== "production") {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err);
  }

  let statusCode = err.status || err.statusCode || res.statusCode;
  // If status is still 200 (Express default), set it to 500
  if (!statusCode || statusCode === 200) statusCode = 500;

  let message = err.message || "Internal server error";

  // ── Mongoose: CastError (invalid ObjectId) ────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  // ── Mongoose: ValidationError ─────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    // collect all field-level messages into a readable string
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
  }

  // ── MongoDB: Duplicate key ────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // ── JWT errors (fallback — should be caught in middleware) ─
  if (err.name === "JsonWebTokenError")  { statusCode = 401; message = "Invalid token"; }
  if (err.name === "TokenExpiredError")  { statusCode = 401; message = "Token expired — please log in again"; }

  res.status(statusCode).json({
    message,
    // include stack trace only in development
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
