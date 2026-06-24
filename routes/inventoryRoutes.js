const express = require("express");
const {
  adjustInventory,
  getInventories,
  getInventoryMovements,
  restockInventory,
  updateInventory,
  upsertInventory,
} = require("../controllers/inventoryController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const {
  inventoryAdjustSchema,
  inventoryPayloadSchema,
  inventoryQuerySchema,
  inventoryRestockSchema,
  inventoryUpdateSchema,
} = require("../validations/inventorySchemas");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/", validateRequest({ query: inventoryQuerySchema }), getInventories);
router.post("/", validateRequest({ body: inventoryPayloadSchema }), upsertInventory);
router.get("/movements", validateRequest({ query: inventoryQuerySchema }), getInventoryMovements);
router.put("/:id", validateRequest({ params: idParamSchema, body: inventoryUpdateSchema }), updateInventory);
router.patch("/:id/restock", validateRequest({ params: idParamSchema, body: inventoryRestockSchema }), restockInventory);
router.patch("/:id/adjust", validateRequest({ params: idParamSchema, body: inventoryAdjustSchema }), adjustInventory);

module.exports = router;
