const { z } = require("zod");

const userRoleSchema = z.enum(["customer", "doctor", "admin"]);

const adminCreateUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255).toLowerCase(),
  phone: z.string().trim().max(20).optional(),
  password: z.string().min(6).max(128),
  role: userRoleSchema.optional(),
});

const adminUpdateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    phone: z.string().trim().max(20).optional(),
    avatar: z.string().trim().max(500).optional(),
    role: userRoleSchema.optional(),
    membershipLevel: z.enum(["member", "silver", "gold", "platinum", "diamond"]).optional(),
    points: z.coerce.number().int().min(0).optional(),
  })
  .strict();

module.exports = {
  adminCreateUserSchema,
  adminUpdateUserSchema,
};
