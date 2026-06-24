const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const userRoleSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `user-role-${randomUUID()}`, unique: true },
    userId: { type: String, required: true, index: true },
    roleId: { type: String, required: true, index: true },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    assignedBy: String,
    assignedAt: { type: Date, default: Date.now },
    revokedBy: String,
    revokedAt: Date,
    note: String,
  },
  { timestamps: true }
);

userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

module.exports = mongoose.model("UserRole", userRoleSchema);
