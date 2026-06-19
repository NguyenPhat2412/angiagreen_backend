const { z } = require("zod");
const { addressSchema, paginationQuerySchema } = require("./commonSchemas");

const createMembershipOrderSchema = z
  .object({
    packageId: z.string().trim().min(1).max(120),
    paymentMethod: z.enum(["cod", "bank", "vnpay"]),
    shippingAddress: addressSchema.omit({ id: true }).optional(),
    note: z.string().trim().max(1000).optional(),
    returnUrl: z.string().trim().url().optional(),
  })
  .strict();

module.exports = {
  createMembershipOrderSchema,
  membershipOrderListQuerySchema: paginationQuerySchema,
};
