const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    categoryId: String,
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    id: String,
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    isDefault: Boolean,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled", "failed", "returned"],
      default: "pending",
    },
    totalAmount: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    voucherCode: String,
    voucherId: String,
    paymentMethod: {
      type: String,
      enum: ["cod", "bank", "vnpay"],
      default: "cod",
    },
    paymentProvider: {
      type: String,
      enum: ["cod", "bank", "vnpay"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "refunded"],
      default: "unpaid",
      index: true,
    },
    transactionNo: { type: String, index: true },
    paidAt: Date,
    paymentRaw: mongoose.Schema.Types.Mixed,
    shippingAddress: { type: addressSchema, required: true },
    shippingStatus: {
      type: String,
      enum: ["pending", "shipping", "delivered", "failed", "returned"],
      default: "pending",
      index: true,
    },
    shippingFailureReason: String,
    shippingResolution: String,
    note: String,
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
