const express = require("express");
const {
  applyVoucher,
  createVoucher,
  disableVoucher,
  getVouchers,
  updateVoucher,
} = require("../controllers/voucherController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const {
  voucherApplySchema,
  voucherPayloadSchema,
  voucherQuerySchema,
  voucherUpdateSchema,
} = require("../validations/voucherSchemas");

const router = express.Router();

router.post("/apply", protect, validateRequest({ body: voucherApplySchema }), applyVoucher);
router.get("/", protect, requireRole("admin"), validateRequest({ query: voucherQuerySchema }), getVouchers);
router.post("/", protect, requireRole("admin"), validateRequest({ body: voucherPayloadSchema }), createVoucher);
router.put("/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema, body: voucherUpdateSchema }), updateVoucher);
router.patch("/:id/disable", protect, requireRole("admin"), validateRequest({ params: idParamSchema }), disableVoucher);

module.exports = router;
