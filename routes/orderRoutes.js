const express = require("express");
const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrder,
} = require("../controllers/orderController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const { orderAdminQuerySchema, orderAdminUpdateSchema } = require("../validations/adminSchemas");
const { createOrderSchema, orderListQuerySchema } = require("../validations/orderSchemas");

const router = express.Router();

router.get("/", protect, requireRole("admin"), validateRequest({ query: orderAdminQuerySchema }), getAllOrders);
router.get("/my", protect, validateRequest({ query: orderListQuerySchema }), getMyOrders);
router.post("/", protect, validateRequest({ body: createOrderSchema }), createOrder);
router.patch("/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema, body: orderAdminUpdateSchema }), updateOrder);
router.get("/:id", protect, validateRequest({ params: idParamSchema }), getOrderById);

module.exports = router;
