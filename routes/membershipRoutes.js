const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getMembershipLevels,
  getMembershipPackages,
  createMembershipOrder,
  getMyMembershipOrders,
  getMembershipOrderById,
} = require("../controllers/membershipController");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const {
  createMembershipOrderSchema,
  membershipOrderListQuerySchema,
} = require("../validations/membershipSchemas");

const router = express.Router();

router.get("/membership-levels", getMembershipLevels);
router.get("/membership-packages", getMembershipPackages);

router.post("/membership-orders", protect, validateRequest({ body: createMembershipOrderSchema }), createMembershipOrder);
router.get("/membership-orders/my", protect, validateRequest({ query: membershipOrderListQuerySchema }), getMyMembershipOrders);
router.get("/membership-orders/:id", protect, validateRequest({ params: idParamSchema }), getMembershipOrderById);

module.exports = router;
