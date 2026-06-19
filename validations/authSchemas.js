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
  otp: z.string().trim().regex(/^\d{6}$/, "OTP phải gồm 6 chữ số"),
  password: passwordSchema,
});

module.exports = {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
};
