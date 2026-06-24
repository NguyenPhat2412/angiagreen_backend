const { z } = require("zod");
const { paginationQuerySchema } = require("./commonSchemas");

const reviewAdminQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["pending", "approved", "hidden", "rejected"]).optional(),
  productId: z.string().trim().max(120).optional(),
});

const reviewAdminUpdateSchema = z
  .object({
    status: z.enum(["pending", "approved", "hidden", "rejected"]).optional(),
    reply: z.string().trim().max(1000).optional(),
  })
  .strict();

module.exports = {
  reviewAdminQuerySchema,
  reviewAdminUpdateSchema,
};
