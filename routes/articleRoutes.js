const express = require("express");
const {
  createArticle,
  deleteArticle,
  getAdminArticles,
  getArticles,
  getArticleBySlug,
  updateArticle,
} = require("../controllers/articleController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema, slugParamSchema } = require("../validations/commonSchemas");
const { articleAdminQuerySchema, articleCreateSchema, articleUpdateSchema } = require("../validations/adminSchemas");
const { articleListQuerySchema } = require("../validations/contentListSchemas");

const router = express.Router();

router.get("/", validateRequest({ query: articleListQuerySchema }), getArticles);
router.get("/admin/list", protect, requireRole("admin"), validateRequest({ query: articleAdminQuerySchema }), getAdminArticles);
router.post("/", protect, requireRole("admin"), validateRequest({ body: articleCreateSchema }), createArticle);
router.get("/:slug", validateRequest({ params: slugParamSchema }), getArticleBySlug);
router.put("/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema, body: articleUpdateSchema }), updateArticle);
router.delete("/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema }), deleteArticle);

module.exports = router;
