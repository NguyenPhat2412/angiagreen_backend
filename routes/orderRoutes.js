const express = require("express");
const { getMyOrders, getOrderById, createOrder } = require("../controllers/orderController");
const { protect } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const { createOrderSchema, orderListQuerySchema } = require("../validations/orderSchemas");

const router = express.Router();

router.get("/my", protect, validateRequest({ query: orderListQuerySchema }), getMyOrders);
router.post("/", protect, validateRequest({ body: createOrderSchema }), createOrder);
router.get("/:id", protect, validateRequest({ params: idParamSchema }), getOrderById);

module.exports = router;
