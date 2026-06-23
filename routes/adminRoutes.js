const express = require("express");
const { getDashboard } = require("../controllers/adminController");
const { protect, requireRole } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/dashboard", getDashboard);

module.exports = router;
