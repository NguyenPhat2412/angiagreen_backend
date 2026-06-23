const express = require("express");
const {
  createProduct,
  deleteProduct,
  getProducts,
  getProductsByIds,
  getProductBySlug,
  getProductReviews,
  createProductReview,
  updateProduct,
} = require("../controllers/productController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema, slugParamSchema } = require("../validations/commonSchemas");
const { productCreateSchema, productUpdateSchema } = require("../validations/adminSchemas");
const {
  productIdsQuerySchema,
  productListQuerySchema,
  reviewBodySchema,
} = require("../validations/productSchemas");

const router = express.Router();

router.get("/", validateRequest({ query: productListQuerySchema }), getProducts);
router.post("/", protect, requireRole("admin"), validateRequest({ body: productCreateSchema }), createProduct);
router.get("/by-ids", validateRequest({ query: productIdsQuerySchema }), getProductsByIds);
router.get("/:slug", validateRequest({ params: slugParamSchema }), getProductBySlug);
router.put("/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema, body: productUpdateSchema }), updateProduct);
router.delete("/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema }), deleteProduct);
router.get("/:id/reviews", validateRequest({ params: idParamSchema }), getProductReviews);
router.post("/:id/reviews", protect, validateRequest({ params: idParamSchema, body: reviewBodySchema }), createProductReview);

module.exports = router;
