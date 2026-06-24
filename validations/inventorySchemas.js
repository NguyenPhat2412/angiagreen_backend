const { z } = require("zod");
const { paginationQuerySchema } = require("./commonSchemas");

const inventoryPayloadSchema = z
  .object({
    productId: z.string().trim().min(1).max(120),
    sku: z.string().trim().min(1).max(120),
    quantityInStock: z.coerce.number().int().min(0).default(0),
    quantityReserved: z.coerce.number().int().min(0).default(0),
    lowStockThreshold: z.coerce.number().int().min(0).default(5),
    warehouseLocation: z.string().trim().max(200).optional(),
  })
  .strict();

const inventoryUpdateSchema = inventoryPayloadSchema.partial();

const inventoryRestockSchema = z
  .object({
    quantity: z.coerce.number().int().min(1),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

const inventoryAdjustSchema = z
  .object({
    quantityInStock: z.coerce.number().int().min(0),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

const inventoryQuerySchema = paginationQuerySchema.extend({
  lowStock: z.coerce.boolean().optional(),
  productId: z.string().trim().max(120).optional(),
});

module.exports = {
  inventoryAdjustSchema,
  inventoryPayloadSchema,
  inventoryQuerySchema,
  inventoryRestockSchema,
  inventoryUpdateSchema,
};
