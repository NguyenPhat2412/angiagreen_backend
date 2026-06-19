const asyncHandler = require("../middlewares/asyncHandler");
const MembershipOrder = require("../models/MembershipOrder");
const Order = require("../models/Order");
const { markMembershipPayment, markProductPayment } = require("../services/payment.service");
const { createPaymentUrl, verifyReturnUrl } = require("../utils/vnpay");

const getOwnerFilter = (req, orderId) => {
  if (req.user.role === "admin") {
    return { id: orderId };
  }

  return { id: orderId, userId: req.user.id };
};

const createPaymentUrlController = asyncHandler(async (req, res) => {
  const { orderId, returnUrl } = req.body;
  let amount = 0;
  let orderInfo = "";

  if (orderId.startsWith("MEM-")) {
    const membershipOrder = await MembershipOrder.findOne(getOwnerFilter(req, orderId)).lean();
    if (!membershipOrder) {
      res.status(404);
      throw new Error("Membership order not found");
    }

    if (membershipOrder.paymentMethod !== "vnpay" || membershipOrder.paymentStatus === "paid") {
      res.status(400);
      throw new Error("Membership order is not payable via VNPay");
    }

    amount = membershipOrder.price;
    orderInfo = `Thanh toan goi hoi vien ${membershipOrder.packageId}`;
  } else {
    const order = await Order.findOne(getOwnerFilter(req, orderId)).lean();
    if (!order) {
      res.status(404);
      throw new Error("Product order not found");
    }

    if (order.paymentMethod !== "vnpay" || order.paymentStatus === "paid") {
      res.status(400);
      throw new Error("Product order is not payable via VNPay");
    }

    amount = order.totalAmount;
    orderInfo = `Thanh toan don hang ${order.id}`;
  }

  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const paymentUrl = createPaymentUrl({
    orderId,
    amount,
    ipAddr: clientIp,
    orderInfo,
    returnUrl,
  });

  res.json({ paymentUrl });
});

const verifyPaymentController = asyncHandler(async (req, res) => {
  const queryParams = req.body;
  const isValid = verifyReturnUrl(queryParams);

  if (!isValid) {
    res.status(400);
    throw new Error("Invalid signature");
  }

  const orderId = queryParams.vnp_TxnRef;
  const isSuccess = queryParams.vnp_ResponseCode === "00";

  if (orderId.startsWith("MEM-")) {
    const order = await markMembershipPayment({ orderId, isSuccess, queryParams });
    res.json({ success: isSuccess, type: "membership", order });
    return;
  }

  const order = await markProductPayment({ orderId, isSuccess, queryParams });
  res.json({ success: isSuccess, type: "product", order });
});

module.exports = { createPaymentUrlController, verifyPaymentController };
