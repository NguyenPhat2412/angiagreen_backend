const express = require("express");
const { getArticles, getArticleBySlug } = require("../controllers/articleController");
const validateRequest = require("../middlewares/validateRequest");
const { slugParamSchema } = require("../validations/commonSchemas");
const { articleListQuerySchema } = require("../validations/contentListSchemas");

const router = express.Router();

router.get("/", validateRequest({ query: articleListQuerySchema }), getArticles);
router.get("/:slug", validateRequest({ params: slugParamSchema }), getArticleBySlug);

module.exports = router;
