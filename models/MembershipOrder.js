const mongoose = require("mongoose");

const membershipOrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    packageId: { type: String, required: true },
    packageName: { type: mongoose.Schema.Types.Mixed, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
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
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      district: String,
      ward: String,
    },
    note: String,
  },
  { timestamps: true }
);

membershipOrderSchema.index({ userId: 1, createdAt: -1 });
membershipOrderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("MembershipOrder", membershipOrderSchema);
