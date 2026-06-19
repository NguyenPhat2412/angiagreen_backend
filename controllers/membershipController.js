const { randomUUID } = require("crypto");
const asyncHandler = require("../middlewares/asyncHandler");
const MembershipLevel = require("../models/MembershipLevel");
const MembershipOrder = require("../models/MembershipOrder");
const MembershipPackage = require("../models/MembershipPackage");
const AppError = require("../utils/AppError");
const { createNotificationOnce } = require("../utils/notifications");
const { getPagination, toPaginatedResponse } = require("../utils/query");
const runInTransaction = require("../utils/runInTransaction");
const { createPaymentUrl } = require("../utils/vnpay");

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

const getMembershipOrderById = asyncHandler(async (req, res) => {
  const order = await MembershipOrder.findOne({ id: req.params.id, userId: req.user.id }).lean();
  if (!order) {
    res.status(404);
    throw new Error("Membership order not found");
  }

  res.json(order);
});

module.exports = {
  getMembershipLevels,
  getMembershipPackages,
  createMembershipOrder,
  getMyMembershipOrders,
  getMembershipOrderById,
};
