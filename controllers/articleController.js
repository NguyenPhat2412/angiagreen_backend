const asyncHandler = require("../middlewares/asyncHandler");
const Article = require("../models/Article");
const { escapeRegex, getPagination, parseSort, toPaginatedResponse } = require("../utils/query");

const getArticles = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query, { limit: 9 });
  const filter = query.category ? { category: query.category } : {};

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

const getArticleBySlug = asyncHandler(async (req, res) => {
  const article = await Article.findOne({
    $or: [{ slug: req.params.slug }, { id: req.params.slug }],
  }).lean();

  if (!article) {
    res.status(404);
    throw new Error("Article not found");
  }

  res.json(article);
});

module.exports = { getArticles, getArticleBySlug };
