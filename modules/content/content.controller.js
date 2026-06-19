const asyncHandler = require("../../middlewares/asyncHandler");
const ContentPage = require("./content.model");

const publishedFilter = { status: "published" };

const getContentPages = asyncHandler(async (req, res) => {
  const filter = { ...publishedFilter };

  if (req.query.group) {
    filter.group = req.query.group;
  }

  const pages = await ContentPage.find(filter).sort({ group: 1, order: 1, createdAt: 1 });
  res.json(pages);
});

const getContentPageByKey = asyncHandler(async (req, res) => {
  const page = await ContentPage.findOne({ key: req.params.key, ...publishedFilter });

  if (!page) {
    res.status(404);
    throw new Error("Content page not found");
  }

  res.json(page);
});

const getPolicies = asyncHandler(async (_req, res) => {
  const pages = await ContentPage.find({ group: "policy", ...publishedFilter }).sort({
    order: 1,
    createdAt: 1,
  });

  res.json(pages);
});

const getPolicyBySlug = asyncHandler(async (req, res) => {
  const page = await ContentPage.findOne({
    key: `policy.${req.params.slug}`,
    group: "policy",
    ...publishedFilter,
  });

  if (!page) {
    res.status(404);
    throw new Error("Policy not found");
  }

  res.json(page);
});

const getSupportPage = asyncHandler(async (req, res) => {
  const page = await ContentPage.findOne({
    key: `support.${req.params.key}`,
    group: "support",
    ...publishedFilter,
  });

  if (!page) {
    res.status(404);
    throw new Error("Support content not found");
  }

  res.json(page);
});

const getCareersPage = asyncHandler(async (_req, res) => {
  const page = await ContentPage.findOne({
    key: "career.index",
    group: "career",
    ...publishedFilter,
  });

  if (!page) {
    res.status(404);
    throw new Error("Careers content not found");
  }

  res.json(page);
});

module.exports = {
  getContentPages,
  getContentPageByKey,
  getPolicies,
  getPolicyBySlug,
  getSupportPage,
  getCareersPage,
};
