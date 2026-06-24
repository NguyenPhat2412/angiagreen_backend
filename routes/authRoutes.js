const express = require("express");
const { adminLogin, register, login, logout, me, forgotPassword, refresh, resetPassword } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { authLimiter, passwordResetLimiter } = require("../middlewares/rateLimiters");
const validateRequest = require("../middlewares/validateRequest");
const {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} = require("../validations/authSchemas");

const router = express.Router();

router.post("/register", authLimiter, validateRequest({ body: registerSchema }), register);
router.post("/login", authLimiter, validateRequest({ body: loginSchema }), login);
router.post("/admin/login", authLimiter, validateRequest({ body: loginSchema }), adminLogin);
router.post("/refresh", authLimiter, validateRequest({ body: refreshTokenSchema }), refresh);
router.post("/logout", protect, validateRequest({ body: logoutSchema }), logout);
router.post("/forgot-password", passwordResetLimiter, validateRequest({ body: forgotPasswordSchema }), forgotPassword);
router.post("/reset-password", passwordResetLimiter, validateRequest({ body: resetPasswordSchema }), resetPassword);
router.get("/me", protect, me);

module.exports = router;
