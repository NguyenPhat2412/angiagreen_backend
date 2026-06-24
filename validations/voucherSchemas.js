const { z } = require("zod");
const { paginationQuerySchema } = require("./commonSchemas");

const localizedTextSchema = z
  .object({
    vi: z.string().trim().min(1).max(500),
    en: z.string().trim().min(1).max(500),
    zh: z.string().trim().min(1).max(500),
  })
  .strict();

const voucherPayloadSchema = z
  .object({
    code: z.string().trim().min(2).max(80).toUpperCase(),
    name: localizedTextSchema,
    description: localizedTextSchema.optional(),
    type: z.enum(["percent", "fixed"]),
    value: z.coerce.number().min(0),
    maxDiscount: z.coerce.number().min(0).optional(),
    minOrderAmount: z.coerce.number().min(0).optional(),
    usageLimit: z.coerce.number().int().min(0).optional(),
    startsAt: z.string().trim().datetime().optional(),
    endsAt: z.string().trim().datetime().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    applicableProductIds: z.array(z.string().trim().min(1).max(120)).optional(),
    applicableCategoryIds: z.array(z.string().trim().min(1).max(120)).optional(),
  })
  .strict();

const voucherUpdateSchema = voucherPayloadSchema.partial();

const voucherApplySchema = z
  .object({
    code: z.string().trim().min(2).max(80).toUpperCase(),
    subtotal: z.coerce.number().min(0),
  })
  .strict();

const voucherQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["active", "inactive"]).optional(),
});

module.exports = {
  voucherApplySchema,
  voucherPayloadSchema,
  voucherQuerySchema,
  voucherUpdateSchema,
};
