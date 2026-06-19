const { z } = require("zod");

const idParamSchema = z.object({
  id: z.string().trim().min(1),
});

const productIdParamSchema = z.object({
  productId: z.string().trim().min(1),
});

const addressIdParamSchema = z.object({
  addressId: z.string().trim().min(1),
});

const paymentMethodIdParamSchema = z.object({
  paymentMethodId: z.string().trim().min(1),
});

const slugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort: z.string().trim().max(40).optional(),
  search: z.string().trim().max(100).optional(),
});

const addressSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(6).max(20),
  address: z.string().trim().min(1).max(255),
  city: z.string().trim().min(1).max(120),
  district: z.string().trim().min(1).max(120),
  ward: z.string().trim().min(1).max(120),
  isDefault: z.boolean().optional(),
});

module.exports = {
  addressIdParamSchema,
  addressSchema,
  idParamSchema,
  paginationQuerySchema,
  paymentMethodIdParamSchema,
  productIdParamSchema,
  slugParamSchema,
};
