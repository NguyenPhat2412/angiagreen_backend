const mongoose = require("mongoose");

const membershipLevelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    level: { type: String, required: true },
    minSpent: { type: Number, required: true },
    discount: { type: Number, required: true },
    pointMultiplier: { type: Number, required: true },
    freeShipping: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    exclusiveOffers: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MembershipLevel", membershipLevelSchema);
