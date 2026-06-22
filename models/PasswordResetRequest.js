const crypto = require("crypto");
const mongoose = require("mongoose");

const passwordResetRequestSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    token: {
      type: String,
      default: () => crypto.randomBytes(32).toString("hex"),
      unique: true,
      index: true,
    },
    otpHash: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["requested", "used", "expired"],
      default: "requested",
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true, expires: 0 },
    sentAt: { type: Date, required: true, default: Date.now, index: true },
    attempts: { type: Number, default: 0 },
    requestedIp: String,
    userAgent: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PasswordResetRequest", passwordResetRequestSchema);
