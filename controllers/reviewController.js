const asyncHandler = require("../middlewares/asyncHandler");
const Review = require("../models/Review");
const { escapeRegex, getPagination, toPaginatedResponse } = require("../utils/query");

const getReviews = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.productId) {
    filter.productId = query.productId;
  }

  if (query.search) {
    const safeSearch = escapeRegex(query.search);
    filter.$or = [
      { userId: { $regex: safeSearch, $options: "i" } },
      { productId: { $regex: safeSearch, $options: "i" } },
      { comment: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(items, { page, limit }, total));
});

const updateReview = asyncHandler(async (req, res) => {
  const update = {
    ...req.body,
    moderatedBy: req.user.id,
    moderatedAt: new Date(),
  };

  if (req.body.reply) {
    update.repliedBy = req.user.id;
    update.repliedAt = new Date();
  }

  const review = await Review.findOneAndUpdate({ id: req.params.id }, update, {
    new: true,
    runValidators: true,
  }).lean();

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  res.json(review);
});

module.exports = {
  getReviews,
  updateReview,
};
