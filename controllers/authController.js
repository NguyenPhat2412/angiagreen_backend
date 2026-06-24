const crypto = require("crypto");
const asyncHandler = require("../middlewares/asyncHandler");
const PasswordResetRequest = require("../models/PasswordResetRequest");
const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");
const { getNumberEnv, requireEnv } = require("../config/env");
const { sendPasswordResetOtp } = require("../utils/mailer");
const generateToken = require("../utils/generateToken");
const toSafeUser = require("../utils/toSafeUser");
const { createAuthPayload, createRefreshToken, hashToken } = require("../utils/tokens");

const RESET_MESSAGE =
  "If the email exists, password reset instructions will be sent.";
const OTP_ATTEMPT_LIMIT = 5;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const createOtp = () => String(crypto.randomInt(100000, 1000000));

const hashOtp = (email, otp) =>
  crypto
    .createHmac("sha256", requireEnv("JWT_SECRET"))
    .update(`${email}:${otp}`)
    .digest("hex");

const isOtpMatch = (email, otp, otpHash) => {
  const nextHash = hashOtp(email, otp);
  const expected = Buffer.from(otpHash);
  const actual = Buffer.from(nextHash);

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!name || !normalizedEmail || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    res.status(409);
    throw new Error("Email already exists");
  }

  const user = await User.create({ name, email: normalizedEmail, phone, password });
  const authPayload = await createAuthPayload({ user, req });
  res.status(201).json({ user: toSafeUser(user), ...authPayload });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.status && user.status !== "active") {
    res.status(403);
    throw new Error("Account is not active");
  }

  const authPayload = await createAuthPayload({ user, req });
  res.json({ user: toSafeUser(user), ...authPayload });
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.role !== "admin") {
    res.status(403);
    throw new Error("Admin account is required");
  }

  if (user.status && user.status !== "active") {
    res.status(403);
    throw new Error("Account is not active");
  }

  const authPayload = await createAuthPayload({ user, req });
  res.json({ user: toSafeUser(user), ...authPayload });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = String(req.body.refreshToken || "").trim();
  const tokenHash = hashToken(refreshToken);
  const storedToken = await RefreshToken.findOne({
    tokenHash,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });

  if (!storedToken) {
    res.status(401);
    throw new Error("Refresh token is invalid or expired");
  }

  const user = await User.findOne({ id: storedToken.userId }).select("-password");
  if (!user || (user.status && user.status !== "active")) {
    res.status(401);
    throw new Error("User is not active");
  }

  storedToken.revokedAt = new Date();
  const nextRefresh = await createRefreshToken({ userId: user.id, req, replacedByTokenHash: tokenHash });
  storedToken.replacedByTokenHash = nextRefresh.tokenHash;
  await storedToken.save();

  const accessToken = generateToken(user);
  res.json({
    user: toSafeUser(user),
    token: accessToken,
    accessToken,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refreshToken: nextRefresh.token,
    refreshTokenExpiresAt: nextRefresh.expiresAt,
  });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = String(req.body.refreshToken || "").trim();

  if (refreshToken) {
    await RefreshToken.findOneAndUpdate(
      { tokenHash: hashToken(refreshToken), userId: req.user.id },
      { revokedAt: new Date() }
    );
  }

  res.json({ message: "Logged out successfully" });
});

const me = asyncHandler(async (req, res) => {
  res.json(toSafeUser(req.user));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const cooldownSeconds = getNumberEnv("OTP_RESEND_COOLDOWN_SECONDS", 30);
  const expiresMinutes = getNumberEnv("OTP_EXPIRES_MINUTES", 5);
  const latestRequest = await PasswordResetRequest.findOne({
    email,
    status: "requested",
  }).sort({ sentAt: -1, createdAt: -1 });

  if (latestRequest?.sentAt) {
    const elapsedMs = Date.now() - latestRequest.sentAt.getTime();
    const cooldownMs = cooldownSeconds * 1000;

    if (elapsedMs < cooldownMs) {
      const resendAfter = Math.ceil((cooldownMs - elapsedMs) / 1000);
      return res.status(429).json({
        message: "Please wait before requesting another OTP.",
        resendAfter,
      });
    }
  }

  const otp = createOtp();
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
  const user = await User.findOne({ email });

  await PasswordResetRequest.create({
    email,
    otpHash: hashOtp(email, otp),
    expiresAt,
    sentAt: new Date(),
    requestedIp: req.ip,
    userAgent: req.get("user-agent"),
  });

  if (user) {
    try {
      await sendPasswordResetOtp({ to: email, otp, expiresMinutes });
    } catch (error) {
      console.error("Password reset email failed:", error.message);
    }
  }

  res.json({ message: RESET_MESSAGE, resendAfter: cooldownSeconds });
});

const resetPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || "").trim();
  const password = String(req.body.password || "");

  if (!email || !otp || !password) {
    res.status(400);
    throw new Error("Email, OTP and password are required");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const resetRequest = await PasswordResetRequest.findOne({
    email,
    otpHash: { $exists: true },
    status: "requested",
    expiresAt: { $gt: new Date() },
  }).sort({ sentAt: -1, createdAt: -1 });

  if (!resetRequest || resetRequest.attempts >= OTP_ATTEMPT_LIMIT) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  if (!isOtpMatch(email, otp, resetRequest.otpHash)) {
    resetRequest.attempts += 1;

    if (resetRequest.attempts >= OTP_ATTEMPT_LIMIT) {
      resetRequest.status = "expired";
    }

    await resetRequest.save();
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    resetRequest.status = "used";
    await resetRequest.save();
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  user.password = password;
  await user.save();

  resetRequest.status = "used";
  await resetRequest.save();

  res.json({ message: "Password has been reset successfully." });
});

module.exports = { adminLogin, register, login, logout, me, forgotPassword, refresh, resetPassword };
