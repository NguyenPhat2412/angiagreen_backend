const asyncHandler = require("../middlewares/asyncHandler");
const Notification = require("../models/Notification");
const { getPagination, toPaginatedResponse } = require("../utils/query");

const getMyNotifications = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const [notifications, total] = await Promise.all([
    Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments({ userId: req.user.id }),
  ]);

  res.json(toPaginatedResponse(notifications, { page, limit }, total));
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { id: req.params.id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.json(notification);
});

module.exports = { getMyNotifications, markNotificationRead };
