const mongoose = require("mongoose");

const membershipPackageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: mongoose.Schema.Types.Mixed, required: true },
    price: { type: Number, required: true },
    description: { type: mongoose.Schema.Types.Mixed, required: true },
    benefits: [{ type: mongoose.Schema.Types.Mixed }],
    image: { type: String, required: true },
    durationDays: { type: Number, default: 30, min: 1 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MembershipPackage", membershipPackageSchema);
