const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: mongoose.Schema.Types.Mixed, required: true },
    slug: { type: String, required: true, unique: true },
    categoryId: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    originalPrice: Number,
    discount: Number,
    image: { type: String, required: true },
    images: [String],
    description: { type: mongoose.Schema.Types.Mixed, required: true },
    shortDescription: mongoose.Schema.Types.Mixed,
    benefits: mongoose.Schema.Types.Mixed,
    usage: mongoose.Schema.Types.Mixed,
    attributes: mongoose.Schema.Types.Mixed,
    origin: String,
    certifications: [String],
    rating: Number,
    soldCount: Number,
    inStock: { type: Boolean, default: true },
    traceability: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

productSchema.index({ categoryId: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ soldCount: -1 });

module.exports = mongoose.model("Product", productSchema);
