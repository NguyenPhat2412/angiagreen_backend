const { writeAuditLog } = require("../utils/audit");

const auditMiddleware = (req, res, next) => {
  res.on("finish", () => {
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
    const shouldAudit = isMutation && req.user && res.statusCode < 500;

    if (!shouldAudit) {
      return;
    }

    const segments = req.originalUrl.split("/").filter(Boolean);
    writeAuditLog({
      req,
      action: `${req.method} ${req.originalUrl}`,
      resource: segments[1] || segments[0],
      resourceId: req.params?.id || req.params?.key || req.params?.productId,
      statusCode: res.statusCode,
      metadata: {
        params: req.params,
        bodyKeys: req.body ? Object.keys(req.body) : [],
      },
    });
  });

  next();
};

module.exports = auditMiddleware;
