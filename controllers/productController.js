const asyncHandler = require("../middlewares/asyncHandler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Review = require("../models/Review");
const { buildResourceIds } = require("../utils/resourceIds");
const { escapeRegex, getPagination, parseSort, toPaginatedResponse } = require("../utils/query");

const getProducts = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { categoryId, search } = query;
  const { page, limit, skip } = getPagination(query, { limit: 12 });
  const sort = parseSort(
    query.sort,
    {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      rating: { rating: -1 },
      popular: { soldCount: -1 },
    },
    { createdAt: 1 }
  );
  const filter = {};

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { "name.vi": { $regex: safeSearch, $options: "i" } },
      { "name.en": { $regex: safeSearch, $options: "i" } },
      { "description.vi": { $regex: safeSearch, $options: "i" } },
      { "description.en": { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(products, { page, limit }, total));
});

const getProductsByIds = asyncHandler(async (req, res) => {
  const ids = String(req.query.ids || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const products = await Product.find({ id: { $in: ids } }).lean();
  res.json(products);
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [{ slug: req.params.slug }, { id: req.params.slug }],
  }).lean();

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 }).lean();
  res.json(reviews);
});

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findOne({ id: req.params.id }).lean();

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const existingReview = await Review.findOne({
    userId: req.user.id,
    productId: product.id,
  });

  if (existingReview) {
    res.status(409);
    throw new Error("Bạn đã đánh giá sản phẩm này rồi");
  }

  const purchasedOrder = await Order.findOne({
    userId: req.user.id,
    "items.productId": product.id,
    $or: [{ status: "delivered" }, { paymentStatus: "paid" }],
  }).lean();

  if (!purchasedOrder) {
    res.status(403);
    throw new Error("Bạn cần mua sản phẩm thành công trước khi đánh giá");
  }

  const review = await Review.create({
    userId: req.user.id,
    productId: product.id,
    rating,
    comment,
  });

  res.status(201).json(review);
});

const createProduct = asyncHandler(async (req, res) => {
  const ids = buildResourceIds(req.body, "name", "product");
  const product = await Product.create({
    ...req.body,
    id: ids.id,
    slug: ids.slug,
  });

  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const nextData = { ...req.body };

  if (nextData.id || nextData.slug || nextData.name) {
    const ids = buildResourceIds({ ...nextData, id: nextData.id || req.params.id }, "name", "product");
    nextData.id = ids.id;
    nextData.slug = ids.slug;
  }

  const product = await Product.findOneAndUpdate({ id: req.params.id }, nextData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ id: req.params.id }).lean();

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ id: req.params.id });
});

module.exports = {
  createProduct,
  createProductReview,
  deleteProduct,
  getProducts,
  getProductsByIds,
  getProductBySlug,
  getProductReviews,
  updateProduct,
};
