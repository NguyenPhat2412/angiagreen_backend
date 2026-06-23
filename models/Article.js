const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: mongoose.Schema.Types.Mixed, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: mongoose.Schema.Types.Mixed, required: true },
    content: mongoose.Schema.Types.Mixed,
    image: { type: String, required: true },
    category: { type: String, required: true },
    tags: [String],
    publishedAt: { type: String, required: true },
    author: String,
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
  },
  { timestamps: true }
);

articleSchema.index({ category: 1, publishedAt: -1 });

module.exports = mongoose.model("Article", articleSchema);
