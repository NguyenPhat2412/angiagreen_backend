const express = require("express");
const {
  addMyAddress,
  addMyFavorite,
  addMyPaymentMethod,
  deleteMyAddress,
  deleteMyFavorite,
  deleteMyPaymentMethod,
  getMyAddresses,
  getMyFavorites,
  getMyPaymentMethods,
  updateMe,
  updateMyAddress,
} = require("./account.controller");
const { protect } = require("../../middlewares/authMiddleware");
const validateRequest = require("../../middlewares/validateRequest");
const {
  addressIdParamSchema,
  paymentMethodIdParamSchema,
  productIdParamSchema,
} = require("../../validations/commonSchemas");
const {
  addressSchema,
  favoriteSchema,
  paymentMethodSchema,
  updateMeSchema,
} = require("../../validations/accountSchemas");

const router = express.Router();

router.use(protect);

router.put("/", validateRequest({ body: updateMeSchema }), updateMe);
router.get("/addresses", getMyAddresses);
router.post("/addresses", validateRequest({ body: addressSchema }), addMyAddress);
router.put("/addresses/:addressId", validateRequest({ params: addressIdParamSchema, body: addressSchema.partial() }), updateMyAddress);
router.delete("/addresses/:addressId", validateRequest({ params: addressIdParamSchema }), deleteMyAddress);
router.get("/favorites", getMyFavorites);
router.post("/favorites", validateRequest({ body: favoriteSchema }), addMyFavorite);
router.delete("/favorites/:productId", validateRequest({ params: productIdParamSchema }), deleteMyFavorite);
router.get("/payment-methods", getMyPaymentMethods);
router.post("/payment-methods", validateRequest({ body: paymentMethodSchema }), addMyPaymentMethod);
router.delete("/payment-methods/:paymentMethodId", validateRequest({ params: paymentMethodIdParamSchema }), deleteMyPaymentMethod);

module.exports = router;
