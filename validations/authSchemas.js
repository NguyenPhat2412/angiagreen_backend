const { z } = require("zod");

const emailSchema = z.string().trim().email().max(255).toLowerCase();
const passwordSchema = z.string().min(6).max(128);

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: emailSchema,
  phone: z.string().trim().max(20).optional(),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must contain 6 digits"),
  password: passwordSchema,
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(20),
});

const logoutSchema = z.object({
  refreshToken: z.string().trim().min(20).optional(),
});

module.exports = {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
};
