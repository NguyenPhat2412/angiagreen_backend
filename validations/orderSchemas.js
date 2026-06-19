const { z } = require("zod");
const { addressSchema, paginationQuerySchema } = require("./commonSchemas");

const orderItemSchema = z
  .object({
    productId: z.string().trim().min(1).max(120),
    quantity: z.coerce.number().int().min(1).max(99),
  })
  .strict();

const createOrderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1).max(50),
    shippingAddress: addressSchema,
    paymentMethod: z.enum(["cod", "bank", "vnpay"]),
    note: z.string().trim().max(1000).optional(),
    returnUrl: z.string().trim().url().optional(),
  })
  .strict();

const orderListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["pending", "confirmed", "shipping", "delivered", "cancelled"]).optional(),
});

module.exports = {
  createOrderSchema,
  orderListQuerySchema,
};
