const { randomUUID } = require("crypto");
const asyncHandler = require("../middlewares/asyncHandler");
const MembershipLevel = require("../models/MembershipLevel");
const MembershipOrder = require("../models/MembershipOrder");
const MembershipPackage = require("../models/MembershipPackage");
const MembershipSubscription = require("../models/MembershipSubscription");
const AppError = require("../utils/AppError");
const { createNotificationOnce } = require("../utils/notifications");
const { escapeRegex, getPagination, toPaginatedResponse } = require("../utils/query");
const { buildResourceIds } = require("../utils/resourceIds");
const runInTransaction = require("../utils/runInTransaction");
const { createPaymentUrl } = require("../utils/vnpay");
const { activateMembershipOrder } = require("../services/membership.service");

const createMembershipOrderId = () => `MEM-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

const getInitialPaymentStatus = (paymentMethod) => (paymentMethod === "cod" ? "unpaid" : "pending");

const getMembershipLevels = asyncHandler(async (_req, res) => {
  const levels = await MembershipLevel.find().sort({ minSpent: 1 }).lean();
  res.json(levels);
});

const getMembershipPackages = asyncHandler(async (_req, res) => {
  const packages = await MembershipPackage.find().sort({ price: 1 }).lean();
  res.json(packages);
});

const createMembershipPackage = asyncHandler(async (req, res) => {
  const ids = buildResourceIds(req.body, "name", "membership-package");
  const package_ = await MembershipPackage.create({
    ...req.body,
    id: ids.id,
  });

  res.status(201).json(package_);
});

const updateMembershipPackage = asyncHandler(async (req, res) => {
  const nextData = { ...req.body };

  if (nextData.id || nextData.name) {
    const ids = buildResourceIds({ ...nextData, id: nextData.id || req.params.id }, "name", "membership-package");
    nextData.id = ids.id;
  }

  const package_ = await MembershipPackage.findOneAndUpdate({ id: req.params.id }, nextData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!package_) {
    res.status(404);
    throw new Error("Membership package not found");
  }

  res.json(package_);
});

const deleteMembershipPackage = asyncHandler(async (req, res) => {
  const package_ = await MembershipPackage.findOneAndDelete({ id: req.params.id }).lean();

  if (!package_) {
    res.status(404);
    throw new Error("Membership package not found");
  }

  res.json({ id: req.params.id });
});

const createMembershipOrder = asyncHandler(async (req, res) => {
  const { packageId, paymentMethod, shippingAddress, note, returnUrl } = req.body;

  if (paymentMethod === "cod" && !shippingAddress) {
    throw new AppError("COD membership order requires a shipping address", 400, "SHIPPING_ADDRESS_REQUIRED");
  }

  const responseData = await runInTransaction(async (session) => {
    const package_ = await MembershipPackage.findOne({ id: packageId }).session(session || null).lean();
    if (!package_) {
      throw new AppError("Membership package not found", 404, "MEMBERSHIP_PACKAGE_NOT_FOUND");
    }

    const orderId = createMembershipOrderId();
    const [order] = await MembershipOrder.create(
      [
        {
          id: orderId,
          userId: req.user.id,
          packageId,
          packageName: package_.name,
          price: package_.price,
          paymentMethod,
          paymentProvider: paymentMethod,
          paymentStatus: getInitialPaymentStatus(paymentMethod),
          shippingAddress,
          note,
          status: "pending",
        },
      ],
      { session }
    );

    await createNotificationOnce(
      {
        userId: req.user.id,
        eventKey: `membership-order-created:${orderId}`,
        title: {
          vi: "Tạo đơn đăng ký hội viên",
          en: "Membership registration created",
          zh: "会员订单已创建",
        },
        content: {
          vi: `Yêu cầu đăng ký gói hội viên ${package_.name.vi} (${orderId}) đang được xử lý.`,
          en: `Request for membership package ${package_.name.en} (${orderId}) is being processed.`,
          zh: `会员套餐 ${package_.name.zh} (${orderId}) 的注册请求正在处理中。`,
        },
        type: "system",
        relatedId: orderId,
      },
      session
    );

    const result = { order: order.toObject() };

    if (paymentMethod === "vnpay") {
      if (!returnUrl) {
        throw new AppError("Return URL is required for VNPay payment", 400, "VNPAY_RETURN_URL_REQUIRED");
      }

      const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      result.paymentUrl = createPaymentUrl({
        orderId,
        amount: package_.price,
        ipAddr: clientIp,
        orderInfo: `Dang ky goi hoi vien ${package_.id}`,
        returnUrl,
      });
    }

    return result;
  });

  res.status(201).json(responseData);
});

const getMyMembershipOrders = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);

  const [orders, total] = await Promise.all([
    MembershipOrder.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    MembershipOrder.countDocuments({ userId: req.user.id }),
  ]);

  res.json(toPaginatedResponse(orders, { page, limit }, total));
});

const getMyMembershipSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await MembershipSubscription.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json(subscriptions);
});

const getAllMembershipSubscriptions = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const safeSearch = escapeRegex(query.search);
    filter.$or = [
      { id: { $regex: safeSearch, $options: "i" } },
      { userId: { $regex: safeSearch, $options: "i" } },
      { packageId: { $regex: safeSearch, $options: "i" } },
      { orderId: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [subscriptions, total] = await Promise.all([
    MembershipSubscription.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    MembershipSubscription.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(subscriptions, { page, limit }, total));
});

const getAllMembershipOrders = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }

  if (query.search) {
    const safeSearch = escapeRegex(query.search);
    filter.$or = [
      { id: { $regex: safeSearch, $options: "i" } },
      { userId: { $regex: safeSearch, $options: "i" } },
      { packageId: { $regex: safeSearch, $options: "i" } },
      { transactionNo: { $regex: safeSearch, $options: "i" } },
      { "shippingAddress.name": { $regex: safeSearch, $options: "i" } },
      { "shippingAddress.phone": { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [orders, total] = await Promise.all([
    MembershipOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    MembershipOrder.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(orders, { page, limit }, total));
});

const getMembershipOrderById = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? { id: req.params.id } : { id: req.params.id, userId: req.user.id };
  const order = await MembershipOrder.findOne(filter).lean();
  if (!order) {
    res.status(404);
    throw new Error("Membership order not found");
  }

  res.json(order);
});

const updateMembershipOrder = asyncHandler(async (req, res) => {
  const nextData = { ...req.body };

  if (nextData.paymentStatus === "paid" && !nextData.paidAt) {
    nextData.paidAt = new Date();
  }

  const order = await MembershipOrder.findOneAndUpdate({ id: req.params.id }, nextData, {
    new: true,
    runValidators: true,
  });

  if (!order) {
    res.status(404);
    throw new Error("Membership order not found");
  }

  if (["completed"].includes(order.status) || order.paymentStatus === "paid") {
    await activateMembershipOrder({
      orderId: order.id,
      actorId: req.user.id,
    });
  }

  const updatedOrder = await MembershipOrder.findOne({ id: order.id }).lean();
  res.json(updatedOrder);
});

module.exports = {
  createMembershipPackage,
  getMembershipLevels,
  getMembershipPackages,
  deleteMembershipPackage,
  createMembershipOrder,
  getAllMembershipOrders,
  getAllMembershipSubscriptions,
  getMyMembershipOrders,
  getMyMembershipSubscriptions,
  getMembershipOrderById,
  updateMembershipOrder,
  updateMembershipPackage,
};
