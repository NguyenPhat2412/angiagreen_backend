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
    email: z.string().trim().email().max(255).toLowerCase().optional(),
    phone: z.string().trim().max(20).optional(),
    avatar: z.string().trim().max(500).optional(),
    role: userRoleSchema.optional(),
    status: z.enum(["active", "locked", "disabled"]).optional(),
    membershipLevel: z.enum(["member", "silver", "gold", "platinum", "diamond"]).optional(),
    points: z.coerce.number().int().min(0).optional(),
  })
  .strict();

const adminAdjustPointsSchema = z
  .object({
    points: z.coerce.number().int(),
    reason: z.string().trim().max(500).optional(),
    referenceType: z.string().trim().max(80).optional(),
    referenceId: z.string().trim().max(120).optional(),
  })
  .strict();

module.exports = {
  adminAdjustPointsSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
};
