const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: mongoose.Schema.Types.Mixed, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, required: true },
    description: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
