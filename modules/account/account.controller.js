const asyncHandler = require("../../middlewares/asyncHandler");
const Product = require("../../models/Product");
const User = require("../../models/User");
const toSafeUser = require("../../utils/toSafeUser");

const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone", "avatar"];
  const update = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      update[field] = req.body[field];
    }
  });

  const user = await User.findOneAndUpdate({ id: req.user.id }, update, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.json(toSafeUser(user));
});

const getMyAddresses = asyncHandler(async (req, res) => {
  res.json(req.user.addresses || []);
});

const addMyAddress = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.user.id });

  if (req.body.isDefault) {
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }

  user.addresses.push(req.body);
  await user.save();
  res.status(201).json(user.addresses);
});

const updateMyAddress = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.user.id });
  const address = user.addresses.find((item) => item.id === req.params.addressId);

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  if (req.body.isDefault) {
    user.addresses.forEach((item) => {
      item.isDefault = false;
    });
  }

  Object.assign(address, req.body);
  await user.save();
  res.json(user.addresses);
});

const deleteMyAddress = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.user.id });
  const initialCount = user.addresses.length;
  user.addresses = user.addresses.filter((item) => item.id !== req.params.addressId);

  if (user.addresses.length === initialCount) {
    res.status(404);
    throw new Error("Address not found");
  }

  await user.save();
  res.json(user.addresses);
});

const getMyFavorites = asyncHandler(async (req, res) => {
  const productIds = req.user.favoriteProductIds || [];
  const products = await Product.find({ id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((product) => [product.id, product]));

  res.json(productIds.map((id) => productMap.get(id)).filter(Boolean));
});

const addMyFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("productId is required");
  }

  const product = await Product.findOne({ id: productId });
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const user = await User.findOne({ id: req.user.id });
  if (!user.favoriteProductIds.includes(productId)) {
    user.favoriteProductIds.push(productId);
    await user.save();
  }

  res.status(201).json({ productId });
});

const deleteMyFavorite = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.user.id });
  user.favoriteProductIds = user.favoriteProductIds.filter((id) => id !== req.params.productId);
  await user.save();
  res.json({ productId: req.params.productId });
});

const getMyPaymentMethods = asyncHandler(async (req, res) => {
  res.json(req.user.paymentMethods || []);
});

const addMyPaymentMethod = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.user.id });

  if (req.body.isDefault) {
    user.paymentMethods.forEach((method) => {
      method.isDefault = false;
    });
  }

  user.paymentMethods.push(req.body);
  await user.save();
  res.status(201).json(user.paymentMethods);
});

const deleteMyPaymentMethod = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.user.id });
  const initialCount = user.paymentMethods.length;
  user.paymentMethods = user.paymentMethods.filter((item) => item.id !== req.params.paymentMethodId);

  if (user.paymentMethods.length === initialCount) {
    res.status(404);
    throw new Error("Payment method not found");
  }

  await user.save();
  res.json(user.paymentMethods);
});

module.exports = {
  updateMe,
  getMyAddresses,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
  getMyFavorites,
  addMyFavorite,
  deleteMyFavorite,
  getMyPaymentMethods,
  addMyPaymentMethod,
  deleteMyPaymentMethod,
};
