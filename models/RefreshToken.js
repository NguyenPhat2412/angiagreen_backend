const crypto = require("crypto");
const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `refresh-${crypto.randomUUID()}`, unique: true },
    userId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: Date,
    replacedByTokenHash: String,
    userAgent: String,
    ip: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
