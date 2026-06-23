const mongoose = require("mongoose");

const localizedTextSchema = {
  vi: { type: String, default: "" },
  en: { type: String, default: "" },
  zh: { type: String, default: "" },
};

const contentPageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    group: {
      type: String,
      enum: ["policy", "support", "career", "marketing"],
      required: true,
      index: true,
    },
    title: { type: localizedTextSchema, required: true },
    description: { type: localizedTextSchema, required: true },
    badge: { type: String, default: "" },
    icon: { type: String, default: "FileText" },
    imageUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    highlights: [
      {
        label: localizedTextSchema,
        value: { type: String, required: true },
      },
    ],
    actions: [
      {
        label: localizedTextSchema,
        href: { type: String, required: true },
        variant: { type: String, enum: ["default", "outline", "secondary"], default: "default" },
      },
    ],
    sections: [
      {
        heading: localizedTextSchema,
        body: localizedTextSchema,
        icon: String,
        items: [localizedTextSchema],
      },
    ],
    cards: [
      {
        title: localizedTextSchema,
        text: localizedTextSchema,
        icon: String,
      },
    ],
    faqs: [
      {
        question: localizedTextSchema,
        answer: localizedTextSchema,
      },
    ],
    jobs: [
      {
        title: localizedTextSchema,
        location: localizedTextSchema,
        type: { type: String, default: "Full-time" },
        applyEmail: { type: String, default: "info@angiagreen.vn" },
      },
    ],
  },
  { timestamps: true }
);

contentPageSchema.index({ group: 1, order: 1 });

module.exports = mongoose.model("ContentPage", contentPageSchema);
