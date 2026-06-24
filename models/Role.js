const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `role-${randomUUID()}`, unique: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
