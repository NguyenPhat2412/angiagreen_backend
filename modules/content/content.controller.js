const asyncHandler = require("../../middlewares/asyncHandler");
const { escapeRegex } = require("../../utils/query");
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

const getAdminContentPages = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.group) {
    filter.group = req.query.group;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    const safeSearch = escapeRegex(req.query.search);
    filter.$or = [
      { key: { $regex: safeSearch, $options: "i" } },
      { "title.vi": { $regex: safeSearch, $options: "i" } },
      { "title.en": { $regex: safeSearch, $options: "i" } },
      { "description.vi": { $regex: safeSearch, $options: "i" } },
      { "description.en": { $regex: safeSearch, $options: "i" } },
    ];
  }

  const pages = await ContentPage.find(filter).sort({ group: 1, order: 1, createdAt: 1 });
  res.json(pages);
});

const getAdminContentPageByKey = asyncHandler(async (req, res) => {
  const page = await ContentPage.findOne({ key: req.params.key });

  if (!page) {
    res.status(404);
    throw new Error("Content page not found");
  }

  res.json(page);
});

const createContentPage = asyncHandler(async (req, res) => {
  const page = await ContentPage.create(req.body);
  res.status(201).json(page);
});

const updateContentPage = asyncHandler(async (req, res) => {
  const page = await ContentPage.findOneAndUpdate({ key: req.params.key }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!page) {
    res.status(404);
    throw new Error("Content page not found");
  }

  res.json(page);
});

const deleteContentPage = asyncHandler(async (req, res) => {
  const page = await ContentPage.findOneAndDelete({ key: req.params.key });

  if (!page) {
    res.status(404);
    throw new Error("Content page not found");
  }

  res.json({ key: req.params.key });
});

module.exports = {
  createContentPage,
  deleteContentPage,
  getAdminContentPageByKey,
  getAdminContentPages,
  getContentPages,
  getContentPageByKey,
  getPolicies,
  getPolicyBySlug,
  getSupportPage,
  getCareersPage,
  updateContentPage,
};
