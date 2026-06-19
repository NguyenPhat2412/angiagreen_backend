const rateLimit = require("express-rate-limit");
const { getNumberEnv } = require("../config/env");

const windowMs = getNumberEnv("AUTH_RATE_LIMIT_WINDOW_MINUTES", 15) * 60 * 1000;

const createLimiter = (max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

const authLimiter = createLimiter(
  getNumberEnv("AUTH_RATE_LIMIT_MAX", 20),
  "Too many authentication attempts. Please try again later."
);

const passwordResetLimiter = createLimiter(
  getNumberEnv("PASSWORD_RESET_RATE_LIMIT_MAX", 5),
  "Too many password reset attempts. Please try again later."
);

module.exports = { authLimiter, passwordResetLimiter };
