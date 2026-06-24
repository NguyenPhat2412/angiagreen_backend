const asyncHandler = require("../middlewares/asyncHandler");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const { ensureInventoryAvailable } = require("../services/inventory.service");

const getMyCart = asyncHandler(async (req, res) => {
  const items = await CartItem.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((product) => [product.id, product]));

  res.json(
    items.map((item) => ({
      ...item,
      product: productMap.get(item.productId) || null,
    }))
  );
});

const addCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity, attributes } = req.body;
  const product = await Product.findOne({ id: productId }).lean();

  if (!product || product.inStock === false) {
    res.status(404);
    throw new Error("Product is not available");
  }

  await ensureInventoryAvailable({ productId, quantity });

  const existingItem = await CartItem.findOne({ userId: req.user.id, productId });

  if (existingItem) {
    const nextQuantity = existingItem.quantity + quantity;
    await ensureInventoryAvailable({ productId, quantity: nextQuantity });
    existingItem.quantity = nextQuantity;
    existingItem.attributes = attributes || existingItem.attributes;
    await existingItem.save();
    return res.status(200).json(existingItem);
  }

  const item = await CartItem.create({
    userId: req.user.id,
    productId,
    quantity,
    attributes,
  });

  res.status(201).json(item);
});

const updateCartItem = asyncHandler(async (req, res) => {
  const item = await CartItem.findOne({ id: req.params.id, userId: req.user.id });

  if (!item) {
    res.status(404);
    throw new Error("Cart item not found");
  }

  await ensureInventoryAvailable({ productId: item.productId, quantity: req.body.quantity });
  item.quantity = req.body.quantity;
  item.attributes = req.body.attributes || item.attributes;
  await item.save();

  res.json(item);
});

const deleteCartItem = asyncHandler(async (req, res) => {
  const item = await CartItem.findOneAndDelete({ id: req.params.id, userId: req.user.id }).lean();

  if (!item) {
    res.status(404);
    throw new Error("Cart item not found");
  }

  res.json({ id: req.params.id });
});

const clearCart = asyncHandler(async (req, res) => {
  await CartItem.deleteMany({ userId: req.user.id });
  res.json({ cleared: true });
});

module.exports = {
  addCartItem,
  clearCart,
  deleteCartItem,
  getMyCart,
  updateCartItem,
};
