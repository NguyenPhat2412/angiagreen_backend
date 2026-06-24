const { z } = require("zod");

const cartItemSchema = z
  .object({
    productId: z.string().trim().min(1).max(120),
    quantity: z.coerce.number().int().min(1).max(99).default(1),
    attributes: z.record(z.string(), z.string()).optional(),
  })
  .strict();

const updateCartItemSchema = z
  .object({
    quantity: z.coerce.number().int().min(1).max(99),
    attributes: z.record(z.string(), z.string()).optional(),
  })
  .strict();

module.exports = {
  cartItemSchema,
  updateCartItemSchema,
};
