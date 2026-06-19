const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `notif-${randomUUID()}`, unique: true },
    userId: { type: String, required: true, index: true },
    title: { type: mongoose.Schema.Types.Mixed, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    type: {
      type: String,
      enum: ["order", "appointment", "promotion", "system"],
      default: "system",
    },
    relatedId: String,
    eventKey: { type: String, unique: true, sparse: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
