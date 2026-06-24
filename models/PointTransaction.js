const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const pointTransactionSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `point-${randomUUID()}`, unique: true },
    userId: { type: String, required: true, index: true },
    points: { type: Number, required: true },
    type: { type: String, enum: ["earn", "redeem", "adjust"], required: true },
    reason: String,
    referenceType: String,
    referenceId: String,
    actorId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PointTransaction", pointTransactionSchema);
