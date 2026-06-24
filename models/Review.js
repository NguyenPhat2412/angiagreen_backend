const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `review-${randomUUID()}`, unique: true },
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    status: { type: String, enum: ["pending", "approved", "hidden", "rejected"], default: "pending", index: true },
    reply: String,
    repliedBy: String,
    repliedAt: Date,
    moderatedBy: String,
    moderatedAt: Date,
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
