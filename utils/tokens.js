const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");
const generateToken = require("./generateToken");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const createRefreshToken = async ({ userId, req, replacedByTokenHash }) => {
  const token = crypto.randomBytes(48).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + generateToken.refreshExpiresInDays() * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
    replacedByTokenHash,
    userAgent: req?.get?.("user-agent"),
    ip: req?.ip,
  });

  return { token, tokenHash, expiresAt };
};

const createAuthPayload = async ({ user, req, replacedByTokenHash }) => {
  const refresh = await createRefreshToken({ userId: user.id, req, replacedByTokenHash });
  const accessToken = generateToken(user);

  return {
    token: accessToken,
    accessToken,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refreshToken: refresh.token,
    refreshTokenExpiresAt: refresh.expiresAt,
  };
};

module.exports = {
  createAuthPayload,
  createRefreshToken,
  hashToken,
};
