const asyncHandler = require("../middlewares/asyncHandler");
const Order = require("../models/Order");
const { createProductOrder } = require("../services/order.service");
const { getPagination, toPaginatedResponse } = require("../utils/query");

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

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ id: req.params.id, userId: req.user.id }).lean();
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

module.exports = { getMyOrders, getOrderById, createOrder };
