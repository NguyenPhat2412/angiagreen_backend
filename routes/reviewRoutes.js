const express = require("express");
const { getReviews, updateReview } = require("../controllers/reviewController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const { reviewAdminQuerySchema, reviewAdminUpdateSchema } = require("../validations/reviewSchemas");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/", validateRequest({ query: reviewAdminQuerySchema }), getReviews);
router.patch("/:id", validateRequest({ params: idParamSchema, body: reviewAdminUpdateSchema }), updateReview);

module.exports = router;
