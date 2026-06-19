const express = require("express");
const {
  getMyNotifications,
  markNotificationRead,
} = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema, paginationQuerySchema } = require("../validations/commonSchemas");

const router = express.Router();

router.get("/my", protect, validateRequest({ query: paginationQuerySchema }), getMyNotifications);
router.patch("/:id/read", protect, validateRequest({ params: idParamSchema }), markNotificationRead);

module.exports = router;
