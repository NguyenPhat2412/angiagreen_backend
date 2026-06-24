const express = require("express");
const {
  addCartItem,
  clearCart,
  deleteCartItem,
  getMyCart,
  updateCartItem,
} = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const { cartItemSchema, updateCartItemSchema } = require("../validations/cartSchemas");

const router = express.Router();

router.use(protect);

router.get("/", getMyCart);
router.post("/", validateRequest({ body: cartItemSchema }), addCartItem);
router.put("/:id", validateRequest({ params: idParamSchema, body: updateCartItemSchema }), updateCartItem);
router.delete("/:id", validateRequest({ params: idParamSchema }), deleteCartItem);
router.delete("/", clearCart);

module.exports = router;
