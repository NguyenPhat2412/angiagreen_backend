const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `voucher-${randomUUID()}`, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: mongoose.Schema.Types.Mixed, required: true },
    description: mongoose.Schema.Types.Mixed,
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    usageLimit: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    startsAt: Date,
    endsAt: Date,
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    applicableProductIds: [String],
    applicableCategoryIds: [String],
  },
  { timestamps: true }
);

voucherSchema.index({ code: 1, status: 1 });

module.exports = mongoose.model("Voucher", voucherSchema);
