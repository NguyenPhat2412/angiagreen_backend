const asyncHandler = require("../middlewares/asyncHandler");
const Order = require("../models/Order");
const OrderStatusHistory = require("../models/OrderStatusHistory");
const { createProductOrder } = require("../services/order.service");
const { commitInventory, releaseInventory } = require("../services/inventory.service");
const { escapeRegex, getPagination, toPaginatedResponse } = require("../utils/query");

const getMyOrders = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = { userId: req.user.id };

  if (query.status) {
    filter.status = query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(orders, { page, limit }, total));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }

  if (query.shippingStatus) {
    filter.shippingStatus = query.shippingStatus;
  }

  if (query.search) {
    const safeSearch = escapeRegex(query.search);
    filter.$or = [
      { id: { $regex: safeSearch, $options: "i" } },
      { userId: { $regex: safeSearch, $options: "i" } },
      { transactionNo: { $regex: safeSearch, $options: "i" } },
      { "shippingAddress.name": { $regex: safeSearch, $options: "i" } },
      { "shippingAddress.phone": { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(orders, { page, limit }, total));
});

const getOrderById = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? { id: req.params.id } : { id: req.params.id, userId: req.user.id };
  const order = await Order.findOne(filter).lean();
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json(order);
});

const createOrder = asyncHandler(async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const order = await createProductOrder({
    userId: req.user.id,
    payload: req.body,
    clientIp,
  });

  res.status(201).json(order);
});

const updateOrder = asyncHandler(async (req, res) => {
  const nextData = { ...req.body };
  const existingOrder = await Order.findOne({ id: req.params.id }).lean();

  if (!existingOrder) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (nextData.paymentStatus === "paid" && !nextData.paidAt) {
    nextData.paidAt = new Date();
  }

  if (nextData.status === "shipping") {
    nextData.shippingStatus = nextData.shippingStatus || "shipping";
  }

  if (nextData.status === "delivered") {
    nextData.shippingStatus = nextData.shippingStatus || "delivered";
  }

  if (["failed", "returned"].includes(nextData.status)) {
    nextData.shippingStatus = nextData.shippingStatus || nextData.status;
  }

  const order = await Order.findOneAndUpdate({ id: req.params.id }, nextData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (nextData.status) {
    await OrderStatusHistory.create({
      orderId: order.id,
      status: nextData.status,
      note: nextData.note || "Updated by admin",
    });

    if (nextData.status === "delivered" && existingOrder.status !== "delivered") {
      await commitInventory({ items: order.items, referenceId: order.id, actorId: req.user.id });
    }

    if (["cancelled", "failed", "returned"].includes(nextData.status) && !["cancelled", "failed", "returned", "delivered"].includes(existingOrder.status)) {
      await releaseInventory({ items: order.items, referenceId: order.id, actorId: req.user.id });
    }
  }

  res.json(order);
});

const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ id: req.params.id, userId: req.user.id });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!["pending", "confirmed"].includes(order.status)) {
    res.status(400);
    throw new Error("Order can no longer be cancelled");
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason;
  await order.save();

  await OrderStatusHistory.create({
    orderId: order.id,
    status: "cancelled",
    note: req.body.reason || "Cancelled by customer",
  });

  await releaseInventory({ items: order.items, referenceId: order.id, actorId: req.user.id });

  res.json(order);
});

module.exports = {
  cancelMyOrder,
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrder,
};
