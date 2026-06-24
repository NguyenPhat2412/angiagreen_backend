const jwt = require("jsonwebtoken");

const generateToken = (user, options = {}) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: options.expiresIn || process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });

generateToken.refreshExpiresInDays = () => Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);

module.exports = generateToken;
