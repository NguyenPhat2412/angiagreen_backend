const { z } = require("zod");
const { addressSchema } = require("./commonSchemas");

const updateMeSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    phone: z.string().trim().max(20).optional(),
    avatar: z.string().trim().max(500).optional(),
  })
  .strict();

const favoriteSchema = z.object({
  productId: z.string().trim().min(1).max(120),
});

const paymentMethodSchema = z
  .object({
    type: z.enum(["cod", "bank", "card", "wallet"]).default("cod"),
    label: z.string().trim().min(1).max(120),
    provider: z.string().trim().max(80).optional(),
    last4: z.string().trim().max(4).optional(),
    isDefault: z.boolean().optional(),
  })
  .strict();

module.exports = {
  addressSchema,
  favoriteSchema,
  paymentMethodSchema,
  updateMeSchema,
};
