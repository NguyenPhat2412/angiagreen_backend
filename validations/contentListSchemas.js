const { z } = require("zod");
const { paginationQuerySchema } = require("./commonSchemas");

const articleListQuerySchema = paginationQuerySchema.extend({
  category: z.string().trim().max(120).optional(),
});

const doctorListQuerySchema = paginationQuerySchema.extend({
  specialty: z.string().trim().max(120).optional(),
});

module.exports = {
  articleListQuerySchema,
  doctorListQuerySchema,
};
