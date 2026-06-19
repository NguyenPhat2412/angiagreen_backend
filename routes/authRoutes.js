const express = require("express");
const { register, login, me, forgotPassword, resetPassword } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { authLimiter, passwordResetLimiter } = require("../middlewares/rateLimiters");
const validateRequest = require("../middlewares/validateRequest");
const {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} = require("../validations/authSchemas");

const router = express.Router();

router.post("/register", authLimiter, validateRequest({ body: registerSchema }), register);
router.post("/login", authLimiter, validateRequest({ body: loginSchema }), login);
router.post("/forgot-password", passwordResetLimiter, validateRequest({ body: forgotPasswordSchema }), forgotPassword);
router.post("/reset-password", passwordResetLimiter, validateRequest({ body: resetPasswordSchema }), resetPassword);
router.get("/me", protect, me);

module.exports = router;
