const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const orderStatusHistorySchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `order-history-${randomUUID()}`, unique: true },
    orderId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      required: true,
    },
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderStatusHistory", orderStatusHistorySchema);
