const { z } = require("zod");
const { paginationQuerySchema } = require("./commonSchemas");

const userRolePayloadSchema = z
  .object({
    userId: z.string().trim().min(1).max(120),
    roleId: z.string().trim().min(1).max(120),
    status: z.enum(["active", "inactive"]).optional(),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

const userRoleUpdateSchema = userRolePayloadSchema.partial();

const rolePayloadSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    code: z.string().trim().min(1).max(120).toLowerCase(),
    description: z.string().trim().max(500).optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .strict();

const roleUpdateSchema = rolePayloadSchema.partial();

const rolePermissionPayloadSchema = z
  .object({
    roleId: z.string().trim().min(1).max(120),
    permissionKey: z.string().trim().min(1).max(160),
    status: z.enum(["active", "inactive"]).optional(),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

const rolePermissionUpdateSchema = rolePermissionPayloadSchema.partial();

const rbacQuerySchema = paginationQuerySchema.extend({
  userId: z.string().trim().max(120).optional(),
  roleId: z.string().trim().max(120).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

module.exports = {
  rbacQuerySchema,
  rolePayloadSchema,
  rolePermissionPayloadSchema,
  rolePermissionUpdateSchema,
  roleUpdateSchema,
  userRolePayloadSchema,
  userRoleUpdateSchema,
};
