const asyncHandler = require("../middlewares/asyncHandler");
const AuditLog = require("../models/AuditLog");
const { getPagination, toPaginatedResponse } = require("../utils/query");

const getAuditLogs = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.actorId) filter.actorId = query.actorId;
  if (query.resource) filter.resource = query.resource;

  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(items, { page, limit }, total));
});

module.exports = {
  getAuditLogs,
};
