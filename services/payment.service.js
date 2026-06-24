const MembershipOrder = require("../models/MembershipOrder");
const Order = require("../models/Order");
const OrderStatusHistory = require("../models/OrderStatusHistory");
const { createNotificationOnce } = require("../utils/notifications");
const runInTransaction = require("../utils/runInTransaction");
const { activateMembershipOrder } = require("./membership.service");

const getTransactionNo = (params) =>
  params.vnp_TransactionNo || params.vnp_BankTranNo || params.vnp_TxnRef;

const getPaymentRaw = (params) => ({
  provider: "vnpay",
  responseCode: params.vnp_ResponseCode,
  transactionStatus: params.vnp_TransactionStatus,
  transactionNo: getTransactionNo(params),
  bankCode: params.vnp_BankCode,
  payDate: params.vnp_PayDate,
  amount: params.vnp_Amount ? Number(params.vnp_Amount) / 100 : undefined,
});

const markProductPayment = async ({ orderId, isSuccess, queryParams }) =>
  runInTransaction(async (session) => {
    const order = await Order.findOne({ id: orderId }).session(session || null);
    if (!order) {
      const error = new Error("Product order not found");
      error.statusCode = 404;
      throw error;
    }

    const paymentRaw = getPaymentRaw(queryParams);
    const transactionNo = getTransactionNo(queryParams);

    if (isSuccess) {
      if (order.paymentStatus !== "paid") {
        if (!["shipping", "delivered"].includes(order.status)) {
          order.status = "confirmed";
        }

        order.paymentStatus = "paid";
        order.paymentProvider = "vnpay";
        order.transactionNo = transactionNo;
        order.paidAt = new Date();
        order.paymentRaw = paymentRaw;
        await order.save({ session });

        const existingHistory = await OrderStatusHistory.findOne({
          orderId: order.id,
          status: "confirmed",
          note: /VNPay/,
        }).session(session || null);

        if (!existingHistory) {
          await OrderStatusHistory.create(
            [
              {
                orderId: order.id,
                status: "confirmed",
                note: "Thanh toán online qua VNPay thành công",
              },
            ],
            { session }
          );
        }

        await createNotificationOnce(
          {
            userId: order.userId,
            eventKey: `payment-success:${order.id}`,
            title: {
              vi: "Thanh toán thành công",
              en: "Payment successful",
              zh: "支付成功",
            },
            content: {
              vi: `Đơn hàng ${order.id} đã được thanh toán thành công qua VNPay.`,
              en: `Order ${order.id} has been paid successfully via VNPay.`,
              zh: `订单 ${order.id} 已通过 VNPay 支付成功。`,
            },
            type: "order",
            relatedId: order.id,
          },
          session
        );
      }
    } else if (order.paymentStatus !== "paid") {
      order.status = "cancelled";
      order.paymentStatus = "failed";
      order.paymentProvider = "vnpay";
      order.transactionNo = transactionNo;
      order.paymentRaw = paymentRaw;
      await order.save({ session });

      await OrderStatusHistory.create(
        [
          {
            orderId: order.id,
            status: "cancelled",
            note: "Thanh toán qua VNPay thất bại",
          },
        ],
        { session }
      );
    }

    return order.toObject();
  });

const markMembershipPayment = async ({ orderId, isSuccess, queryParams }) =>
  runInTransaction(async (session) => {
    const membershipOrder = await MembershipOrder.findOne({ id: orderId }).session(session || null);
    if (!membershipOrder) {
      const error = new Error("Membership order not found");
      error.statusCode = 404;
      throw error;
    }

    const paymentRaw = getPaymentRaw(queryParams);
    const transactionNo = getTransactionNo(queryParams);

    if (isSuccess) {
      if (membershipOrder.paymentStatus !== "paid") {
        membershipOrder.status = "completed";
        membershipOrder.paymentStatus = "paid";
        membershipOrder.paymentProvider = "vnpay";
        membershipOrder.transactionNo = transactionNo;
        membershipOrder.paidAt = new Date();
        membershipOrder.paymentRaw = paymentRaw;
        await membershipOrder.save({ session });

        await activateMembershipOrder({
          orderId: membershipOrder.id,
          actorId: "system",
          session,
        });

        await createNotificationOnce(
          {
            userId: membershipOrder.userId,
            eventKey: `membership-payment-success:${membershipOrder.id}`,
            title: {
              vi: "Đăng ký hội viên thành công",
              en: "Membership registered successfully",
              zh: "会员注册成功",
            },
            content: {
              vi: "Cảm ơn bạn đã đăng ký gói hội viên. Quyền lợi tài khoản của bạn đã được kích hoạt.",
              en: "Thank you for purchasing membership. Your privileges have been activated.",
              zh: "感谢您购买会员服务，您的会员权益已激活。",
            },
            type: "system",
            relatedId: membershipOrder.id,
          },
          session
        );
      }
    } else if (membershipOrder.paymentStatus !== "paid") {
      membershipOrder.status = "cancelled";
      membershipOrder.paymentStatus = "failed";
      membershipOrder.paymentProvider = "vnpay";
      membershipOrder.transactionNo = transactionNo;
      membershipOrder.paymentRaw = paymentRaw;
      await membershipOrder.save({ session });
    }

    return membershipOrder.toObject();
  });

module.exports = {
  markMembershipPayment,
  markProductPayment,
};
