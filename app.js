const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const { getAllowedOrigins } = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./modules/account/account.routes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const articleRoutes = require("./routes/articleRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const doctorScheduleRoutes = require("./routes/doctorScheduleRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const contentRoutes = require("./modules/content/content.routes");
const paymentRoutes = require("./routes/paymentRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const adminRoutes = require("./routes/adminRoutes");
const rbacRoutes = require("./routes/rbacRoutes");
const auditRoutes = require("./routes/auditRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const requestContext = require("./middlewares/requestContext");
const sanitizeRequest = require("./middlewares/sanitizeMiddleware");
const auditMiddleware = require("./middlewares/auditMiddleware");
const connectDB = require("./config/db");

const app = express();

app.use(compression());

// Ensure DB connection before handling any request (Serverless friendly)
app.use(async (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

const allowedOrigins = getAllowedOrigins();

if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
  throw new Error("ALLOWED_ORIGINS must be configured in production");
}

app.set("trust proxy", 1);
app.use(requestContext);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || (allowedOrigins.length === 0 && process.env.NODE_ENV !== "production") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error("Not allowed by CORS");
      error.statusCode = 403;
      callback(error);
    },
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(sanitizeRequest);
app.use(auditMiddleware);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "angiagreen-api", requestId: res.getHeader("x-request-id") });
});

app.use("/api/auth", authRoutes);
app.use("/api/users/me", accountRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/doctor-schedules", doctorScheduleRoutes);
app.use("/api", membershipRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/rbac", rbacRoutes);
app.use("/api/audit-logs", auditRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
