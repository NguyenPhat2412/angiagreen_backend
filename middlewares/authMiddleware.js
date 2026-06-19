const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const User = require("../models/User");
const { requireEnv } = require("../config/env");
const AppError = require("../utils/AppError");

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Không có quyền truy cập, thiếu token", 401, "AUTH_TOKEN_MISSING");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, requireEnv("JWT_SECRET"));
  } catch {
    throw new AppError("Token không hợp lệ hoặc đã hết hạn", 401, "AUTH_TOKEN_INVALID");
  }

  const user = await User.findOne({ id: decoded.id }).select("-password");

  if (!user) {
    throw new AppError("Không có quyền truy cập, không tìm thấy người dùng", 401, "AUTH_USER_NOT_FOUND");
  }

  req.user = user;
  next();
});

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) {
    next(new AppError("Không có quyền truy cập", 401, "AUTH_REQUIRED"));
    return;
  }

  if (!roles.includes(req.user.role)) {
    next(new AppError("Bạn không có quyền thực hiện thao tác này", 403, "FORBIDDEN"));
    return;
  }

  next();
};

module.exports = { protect, requireRole };
