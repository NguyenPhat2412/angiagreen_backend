const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  createPaymentUrlController,
  verifyPaymentController,
} = require("../controllers/paymentController");
const validateRequest = require("../middlewares/validateRequest");
const { createVNPayUrlSchema, verifyVNPaySchema } = require("../validations/paymentSchemas");

const router = express.Router();

router.post("/create-vnpay-url", protect, validateRequest({ body: createVNPayUrlSchema }), createPaymentUrlController);
router.post("/vnpay-verify", validateRequest({ body: verifyVNPaySchema }), verifyPaymentController);

module.exports = router;
