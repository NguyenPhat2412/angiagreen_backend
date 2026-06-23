const asyncHandler = require("../middlewares/asyncHandler");
const Category = require("../models/Category");
const { buildResourceIds } = require("../utils/resourceIds");

const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ createdAt: 1 }).lean();
  res.json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const ids = buildResourceIds(req.body, "name", "category");
  const category = await Category.create({
    ...req.body,
    id: ids.id,
    slug: ids.slug,
  });

  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const nextData = { ...req.body };

  if (nextData.id || nextData.slug || nextData.name) {
    const ids = buildResourceIds({ ...nextData, id: nextData.id || req.params.id }, "name", "category");
    nextData.id = ids.id;
    nextData.slug = ids.slug;
  }

  const category = await Category.findOneAndUpdate({ id: req.params.id }, nextData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({ id: req.params.id }).lean();

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json({ id: req.params.id });
});

module.exports = {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
};
