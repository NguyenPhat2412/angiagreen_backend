const AuditLog = require("../models/AuditLog");

const writeAuditLog = async ({
  req,
  action,
  resource,
  resourceId,
  statusCode,
  metadata,
  actorType,
}) => {
  try {
    await AuditLog.create({
      actorId: req?.user?.id,
      actorRole: req?.user?.role,
      actorType: actorType || (req?.user?.role === "admin" ? "admin" : "user"),
      action,
      resource,
      resourceId,
      method: req?.method,
      path: req?.originalUrl,
      statusCode,
      ip: req?.ip,
      userAgent: req?.get?.("user-agent"),
      metadata,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Audit log failed:", error.message);
    }
  }
};

module.exports = {
  writeAuditLog,
};
