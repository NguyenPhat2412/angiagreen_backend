const express = require("express");
const {
  createContentPage,
  deleteContentPage,
  getAdminContentPageByKey,
  getAdminContentPages,
  getCareersPage,
  getContentPageByKey,
  getContentPages,
  getPolicies,
  getPolicyBySlug,
  getSupportPage,
  updateContentPage,
} = require("./content.controller");
const { protect, requireRole } = require("../../middlewares/authMiddleware");
const validateRequest = require("../../middlewares/validateRequest");
const { contentAdminQuerySchema, contentPageCreateSchema, contentPageUpdateSchema } = require("../../validations/adminSchemas");

const router = express.Router();

router.get("/admin/pages", protect, requireRole("admin"), validateRequest({ query: contentAdminQuerySchema }), getAdminContentPages);
router.post("/admin/pages", protect, requireRole("admin"), validateRequest({ body: contentPageCreateSchema }), createContentPage);
router.get("/admin/pages/:key", protect, requireRole("admin"), getAdminContentPageByKey);
router.put("/admin/pages/:key", protect, requireRole("admin"), validateRequest({ body: contentPageUpdateSchema }), updateContentPage);
router.delete("/admin/pages/:key", protect, requireRole("admin"), deleteContentPage);
router.get("/pages", getContentPages);
router.get("/pages/:key", getContentPageByKey);
router.get("/policies", getPolicies);
router.get("/policies/:slug", getPolicyBySlug);
router.get("/support/:key", getSupportPage);
router.get("/careers", getCareersPage);

module.exports = router;
