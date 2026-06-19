const asyncHandler = require("../middlewares/asyncHandler");
const Category = require("../models/Category");

const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ createdAt: 1 }).lean();
  res.json(categories);
});

module.exports = { getCategories };
