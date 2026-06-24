const asyncHandler = require("../middlewares/asyncHandler");
const Inventory = require("../models/Inventory");
const InventoryMovement = require("../models/InventoryMovement");
const Product = require("../models/Product");
const { escapeRegex, getPagination, toPaginatedResponse } = require("../utils/query");

const withAvailability = (inventory) => ({
  ...inventory,
  availableQuantity: Math.max(0, (inventory.quantityInStock || 0) - (inventory.quantityReserved || 0)),
  isLowStock: Math.max(0, (inventory.quantityInStock || 0) - (inventory.quantityReserved || 0)) <= (inventory.lowStockThreshold || 0),
});

const getInventories = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.productId) {
    filter.productId = query.productId;
  }

  if (query.search) {
    const safeSearch = escapeRegex(query.search);
    filter.$or = [
      { productId: { $regex: safeSearch, $options: "i" } },
      { sku: { $regex: safeSearch, $options: "i" } },
      { warehouseLocation: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Inventory.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Inventory.countDocuments(filter),
  ]);

  const mappedItems = items.map(withAvailability).filter((item) => !query.lowStock || item.isLowStock);

  res.json(toPaginatedResponse(mappedItems, { page, limit }, query.lowStock ? mappedItems.length : total));
});

const upsertInventory = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ id: req.body.productId }).lean();
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const inventory = await Inventory.findOneAndUpdate(
    { productId: req.body.productId },
    req.body,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  res.status(201).json(withAvailability(inventory));
});

const updateInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findOneAndUpdate({ id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!inventory) {
    res.status(404);
    throw new Error("Inventory not found");
  }

  res.json(withAvailability(inventory));
});

const restockInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findOne({ id: req.params.id });

  if (!inventory) {
    res.status(404);
    throw new Error("Inventory not found");
  }

  inventory.quantityInStock += req.body.quantity;
  inventory.lastRestocked = new Date();
  await inventory.save();

  await InventoryMovement.create({
    productId: inventory.productId,
    sku: inventory.sku,
    type: "restock",
    quantity: req.body.quantity,
    actorId: req.user.id,
    note: req.body.note,
  });

  res.json(withAvailability(inventory.toObject()));
});

const adjustInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findOne({ id: req.params.id });

  if (!inventory) {
    res.status(404);
    throw new Error("Inventory not found");
  }

  const diff = req.body.quantityInStock - inventory.quantityInStock;
  inventory.quantityInStock = req.body.quantityInStock;
  await inventory.save();

  await InventoryMovement.create({
    productId: inventory.productId,
    sku: inventory.sku,
    type: "adjust",
    quantity: diff,
    actorId: req.user.id,
    note: req.body.note,
  });

  res.json(withAvailability(inventory.toObject()));
});

const getInventoryMovements = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.productId) {
    filter.productId = query.productId;
  }

  const [items, total] = await Promise.all([
    InventoryMovement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    InventoryMovement.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(items, { page, limit }, total));
});

module.exports = {
  adjustInventory,
  getInventories,
  getInventoryMovements,
  restockInventory,
  updateInventory,
  upsertInventory,
};
