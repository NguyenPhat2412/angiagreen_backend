const express = require("express");
const {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} = require("../controllers/categoryController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const { categoryCreateSchema, categoryUpdateSchema } = require("../validations/adminSchemas");

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, requireRole("admin"), validateRequest({ body: categoryCreateSchema }), createCategory);
router.put("/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema, body: categoryUpdateSchema }), updateCategory);
router.delete("/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema }), deleteCategory);

module.exports = router;
