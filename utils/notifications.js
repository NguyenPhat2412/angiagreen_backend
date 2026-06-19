const Notification = require("../models/Notification");

async function createNotificationOnce(payload, session) {
  if (!payload.eventKey) {
    const [notification] = await Notification.create([payload], { session });
    return notification;
  }

  const existing = await Notification.findOne({ eventKey: payload.eventKey }).session(session || null);
  if (existing) {
    return existing;
  }

  const [notification] = await Notification.create([payload], { session });
  return notification;
}

module.exports = { createNotificationOnce };
