const express = require("express");
const { z } = require("zod");
const { getAuditLogs } = require("../controllers/auditController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { paginationQuerySchema } = require("../validations/commonSchemas");

const auditQuerySchema = paginationQuerySchema.extend({
  actorId: z.string().trim().max(120).optional(),
  resource: z.string().trim().max(120).optional(),
});

const router = express.Router();

router.get("/", protect, requireRole("admin"), validateRequest({ query: auditQuerySchema }), getAuditLogs);

module.exports = router;
