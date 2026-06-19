const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `cart-${randomUUID()}`, unique: true },
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    attributes: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("CartItem", cartItemSchema);
