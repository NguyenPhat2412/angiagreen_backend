const express = require("express");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const {
  createMembershipPackage,
  deleteMembershipPackage,
  getAllMembershipOrders,
  getAllMembershipSubscriptions,
  getMembershipLevels,
  getMembershipPackages,
  createMembershipOrder,
  getMyMembershipOrders,
  getMyMembershipSubscriptions,
  getMembershipOrderById,
  updateMembershipOrder,
  updateMembershipPackage,
} = require("../controllers/membershipController");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const {
  membershipOrderAdminQuerySchema,
  membershipOrderAdminUpdateSchema,
  membershipSubscriptionAdminQuerySchema,
  membershipPackageCreateSchema,
  membershipPackageUpdateSchema,
} = require("../validations/adminSchemas");
const {
  createMembershipOrderSchema,
  membershipOrderListQuerySchema,
} = require("../validations/membershipSchemas");

const router = express.Router();

router.get("/membership-levels", getMembershipLevels);
router.get("/membership-packages", getMembershipPackages);
router.post("/membership-packages", protect, requireRole("admin"), validateRequest({ body: membershipPackageCreateSchema }), createMembershipPackage);
router.put("/membership-packages/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema, body: membershipPackageUpdateSchema }), updateMembershipPackage);
router.delete("/membership-packages/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema }), deleteMembershipPackage);

router.post("/membership-orders", protect, validateRequest({ body: createMembershipOrderSchema }), createMembershipOrder);
router.get("/membership-orders", protect, requireRole("admin"), validateRequest({ query: membershipOrderAdminQuerySchema }), getAllMembershipOrders);
router.get("/membership-orders/my", protect, validateRequest({ query: membershipOrderListQuerySchema }), getMyMembershipOrders);
router.patch("/membership-orders/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema, body: membershipOrderAdminUpdateSchema }), updateMembershipOrder);
router.get("/membership-orders/:id", protect, validateRequest({ params: idParamSchema }), getMembershipOrderById);
router.get("/membership-subscriptions", protect, requireRole("admin"), validateRequest({ query: membershipSubscriptionAdminQuerySchema }), getAllMembershipSubscriptions);
router.get("/membership-subscriptions/my", protect, getMyMembershipSubscriptions);

module.exports = router;
