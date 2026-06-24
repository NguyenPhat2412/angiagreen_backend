const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `audit-${randomUUID()}`, unique: true },
    actorId: String,
    actorRole: String,
    actorType: { type: String, enum: ["user", "admin", "doctor", "system"], default: "user" },
    action: { type: String, required: true },
    resource: String,
    resourceId: String,
    method: String,
    path: String,
    statusCode: Number,
    ip: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
