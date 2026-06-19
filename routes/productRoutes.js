const express = require("express");
const {
  getProducts,
  getProductsByIds,
  getProductBySlug,
  getProductReviews,
  createProductReview,
} = require("../controllers/productController");
const { protect } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema, slugParamSchema } = require("../validations/commonSchemas");
const {
  productIdsQuerySchema,
  productListQuerySchema,
  reviewBodySchema,
} = require("../validations/productSchemas");

const router = express.Router();

router.get("/", validateRequest({ query: productListQuerySchema }), getProducts);
router.get("/by-ids", validateRequest({ query: productIdsQuerySchema }), getProductsByIds);
router.get("/:slug", validateRequest({ params: slugParamSchema }), getProductBySlug);
router.get("/:id/reviews", validateRequest({ params: idParamSchema }), getProductReviews);
router.post("/:id/reviews", protect, validateRequest({ params: idParamSchema, body: reviewBodySchema }), createProductReview);

module.exports = router;
