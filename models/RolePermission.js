const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const rolePermissionSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `role-permission-${randomUUID()}`, unique: true },
    roleId: { type: String, required: true, index: true },
    permissionKey: { type: String, required: true, index: true },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    note: String,
  },
  { timestamps: true }
);

rolePermissionSchema.index({ roleId: 1, permissionKey: 1 }, { unique: true });

module.exports = mongoose.model("RolePermission", rolePermissionSchema);
