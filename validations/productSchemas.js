const { z } = require("zod");
const { paginationQuerySchema } = require("./commonSchemas");

const productListQuerySchema = paginationQuerySchema.extend({
  categoryId: z.string().trim().max(120).optional(),
});

const productIdsQuerySchema = z.object({
  ids: z.string().trim().min(1).max(2000),
});

const reviewBodySchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().max(1000).optional(),
  })
  .strict();

module.exports = {
  productIdsQuerySchema,
  productListQuerySchema,
  reviewBodySchema,
};
