const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `inventory-${randomUUID()}`, unique: true },
    productId: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, trim: true, unique: true },
    quantityInStock: { type: Number, default: 0, min: 0 },
    quantityReserved: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    warehouseLocation: String,
    lastRestocked: Date,
  },
  { timestamps: true }
);

inventorySchema.virtual("availableQuantity").get(function availableQuantity() {
  return Math.max(0, (this.quantityInStock || 0) - (this.quantityReserved || 0));
});

inventorySchema.set("toJSON", { virtuals: true });
inventorySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Inventory", inventorySchema);
