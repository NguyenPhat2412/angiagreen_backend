const asyncHandler = require("../middlewares/asyncHandler");
const Article = require("../models/Article");
const { buildResourceIds } = require("../utils/resourceIds");
const { escapeRegex, getPagination, parseSort, toPaginatedResponse } = require("../utils/query");

const getArticles = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query, { limit: 9 });
  const filter = query.category ? { category: query.category, status: { $ne: "draft" } } : { status: { $ne: "draft" } };

  if (query.search) {
    const safeSearch = escapeRegex(query.search);
    filter.$or = [
      { "title.vi": { $regex: safeSearch, $options: "i" } },
      { "title.en": { $regex: safeSearch, $options: "i" } },
      { "excerpt.vi": { $regex: safeSearch, $options: "i" } },
      { "excerpt.en": { $regex: safeSearch, $options: "i" } },
    ];
  }

  const sort = parseSort(
    query.sort,
    {
      newest: { publishedAt: -1 },
      oldest: { publishedAt: 1 },
    },
    { publishedAt: -1 }
  );
  const [articles, total] = await Promise.all([
    Article.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Article.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(articles, { page, limit }, total));
});

const getAdminArticles = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query, { limit: 12 });
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const safeSearch = escapeRegex(query.search);
    filter.$or = [
      { id: { $regex: safeSearch, $options: "i" } },
      { slug: { $regex: safeSearch, $options: "i" } },
      { "title.vi": { $regex: safeSearch, $options: "i" } },
      { "title.en": { $regex: safeSearch, $options: "i" } },
      { "excerpt.vi": { $regex: safeSearch, $options: "i" } },
      { "excerpt.en": { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [articles, total] = await Promise.all([
    Article.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Article.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(articles, { page, limit }, total));
});

const getArticleBySlug = asyncHandler(async (req, res) => {
  const article = await Article.findOne({
    $or: [{ slug: req.params.slug }, { id: req.params.slug }],
    status: { $ne: "draft" },
  }).lean();

  if (!article) {
    res.status(404);
    throw new Error("Article not found");
  }

  res.json(article);
});

const createArticle = asyncHandler(async (req, res) => {
  const ids = buildResourceIds(req.body, "title", "article");
  const article = await Article.create({
    ...req.body,
    id: ids.id,
    slug: ids.slug,
    publishedAt: req.body.publishedAt || new Date().toISOString(),
  });

  res.status(201).json(article);
});

const updateArticle = asyncHandler(async (req, res) => {
  const nextData = { ...req.body };

  if (nextData.id || nextData.slug || nextData.title) {
    const ids = buildResourceIds({ ...nextData, id: nextData.id || req.params.id }, "title", "article");
    nextData.id = ids.id;
    nextData.slug = ids.slug;
  }

  const article = await Article.findOneAndUpdate({ id: req.params.id }, nextData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!article) {
    res.status(404);
    throw new Error("Article not found");
  }

  res.json(article);
});

const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findOneAndDelete({ id: req.params.id }).lean();

  if (!article) {
    res.status(404);
    throw new Error("Article not found");
  }

  res.json({ id: req.params.id });
});

module.exports = {
  createArticle,
  deleteArticle,
  getAdminArticles,
  getArticles,
  getArticleBySlug,
  updateArticle,
};
