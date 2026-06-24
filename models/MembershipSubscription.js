const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const membershipSubscriptionSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `subscription-${randomUUID()}`, unique: true },
    userId: { type: String, required: true, index: true },
    packageId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, unique: true },
    packageName: mongoose.Schema.Types.Mixed,
    price: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending_payment"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MembershipSubscription", membershipSubscriptionSchema);
