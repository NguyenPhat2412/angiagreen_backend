const express = require("express");
const {
  getCareersPage,
  getContentPageByKey,
  getContentPages,
  getPolicies,
  getPolicyBySlug,
  getSupportPage,
} = require("./content.controller");

const router = express.Router();

router.get("/pages", getContentPages);
router.get("/pages/:key", getContentPageByKey);
router.get("/policies", getPolicies);
router.get("/policies/:slug", getPolicyBySlug);
router.get("/support/:key", getSupportPage);
router.get("/careers", getCareersPage);

module.exports = router;
