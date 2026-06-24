const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const inventoryMovementSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `inventory-move-${randomUUID()}`, unique: true },
    productId: { type: String, required: true, index: true },
    sku: String,
    type: {
      type: String,
      enum: ["restock", "reserve", "release", "commit", "adjust"],
      required: true,
    },
    quantity: { type: Number, required: true },
    referenceType: String,
    referenceId: String,
    note: String,
    actorId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryMovement", inventoryMovementSchema);
