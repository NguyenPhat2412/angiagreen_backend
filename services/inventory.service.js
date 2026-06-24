const Inventory = require("../models/Inventory");
const InventoryMovement = require("../models/InventoryMovement");
const AppError = require("../utils/AppError");

const getAvailable = (inventory) => Math.max(0, (inventory.quantityInStock || 0) - (inventory.quantityReserved || 0));

const ensureInventoryAvailable = async ({ productId, quantity, session }) => {
  const inventory = await Inventory.findOne({ productId }).session(session || null);

  if (!inventory) {
    return null;
  }

  if (getAvailable(inventory) < quantity) {
    throw new AppError(`Sản phẩm ${productId} không đủ tồn kho`, 400, "INVENTORY_NOT_ENOUGH");
  }

  return inventory;
};

const reserveInventory = async ({ items, referenceId, actorId, session }) => {
  for (const item of items) {
    const inventory = await ensureInventoryAvailable({
      productId: item.productId,
      quantity: item.quantity,
      session,
    });

    if (!inventory) {
      continue;
    }

    inventory.quantityReserved += item.quantity;
    await inventory.save({ session });
    await InventoryMovement.create(
      [
        {
          productId: item.productId,
          sku: inventory.sku,
          type: "reserve",
          quantity: item.quantity,
          referenceType: "order",
          referenceId,
          actorId,
          note: "Reserved for order",
        },
      ],
      { session }
    );
  }
};

const releaseInventory = async ({ items, referenceId, actorId, session }) => {
  for (const item of items) {
    const inventory = await Inventory.findOne({ productId: item.productId }).session(session || null);
    if (!inventory) {
      continue;
    }

    inventory.quantityReserved = Math.max(0, inventory.quantityReserved - item.quantity);
    await inventory.save({ session });
    await InventoryMovement.create(
      [
        {
          productId: item.productId,
          sku: inventory.sku,
          type: "release",
          quantity: item.quantity,
          referenceType: "order",
          referenceId,
          actorId,
          note: "Released order reservation",
        },
      ],
      { session }
    );
  }
};

const commitInventory = async ({ items, referenceId, actorId, session }) => {
  for (const item of items) {
    const inventory = await Inventory.findOne({ productId: item.productId }).session(session || null);
    if (!inventory) {
      continue;
    }

    inventory.quantityReserved = Math.max(0, inventory.quantityReserved - item.quantity);
    inventory.quantityInStock = Math.max(0, inventory.quantityInStock - item.quantity);
    await inventory.save({ session });
    await InventoryMovement.create(
      [
        {
          productId: item.productId,
          sku: inventory.sku,
          type: "commit",
          quantity: item.quantity,
          referenceType: "order",
          referenceId,
          actorId,
          note: "Committed delivered order",
        },
      ],
      { session }
    );
  }
};

module.exports = {
  commitInventory,
  ensureInventoryAvailable,
  getAvailable,
  releaseInventory,
  reserveInventory,
};
