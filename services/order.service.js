const { randomUUID } = require("crypto");
const Order = require("../models/Order");
const OrderStatusHistory = require("../models/OrderStatusHistory");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const { createNotificationOnce } = require("../utils/notifications");
const runInTransaction = require("../utils/runInTransaction");
const { createPaymentUrl } = require("../utils/vnpay");

const FREE_SHIPPING_THRESHOLD = 500000;
const DEFAULT_SHIPPING_FEE = 30000;

const createOrderId = () => `ORD-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

const getLocalizedProductName = (name) => {
  if (typeof name === "string") {
    return name;
  }

  return name?.vi || name?.en || name?.zh || "Sản phẩm";
};

const normalizeItems = (items) => {
  const itemMap = new Map();

  items.forEach((item) => {
    const productId = item.productId.trim();
    const current = itemMap.get(productId) || { productId, quantity: 0 };
    current.quantity += Number(item.quantity);
    itemMap.set(productId, current);
  });

  return Array.from(itemMap.values());
};

const buildOrderItems = async (items, session) => {
  const normalizedItems = normalizeItems(items);
  const productIds = normalizedItems.map((item) => item.productId);
  const products = await Product.find({ id: { $in: productIds } }).session(session || null).lean();
  const productMap = new Map(products.map((product) => [product.id, product]));

  return normalizedItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new AppError(`Không tìm thấy sản phẩm: ${item.productId}`, 404, "PRODUCT_NOT_FOUND");
    }

    if (product.inStock === false) {
      throw new AppError(`Sản phẩm ${getLocalizedProductName(product.name)} hiện đã hết hàng`, 400, "PRODUCT_OUT_OF_STOCK");
    }

    return {
      productId: product.id,
      productName: getLocalizedProductName(product.name),
      quantity: item.quantity,
      price: product.price,
      image: product.image,
    };
  });
};

const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
  const discount = 0;

  return {
    subtotal,
    shippingFee,
    discount,
    totalAmount: Math.max(0, subtotal + shippingFee - discount),
  };
};

const getInitialPaymentStatus = (paymentMethod) => {
  if (paymentMethod === "cod") {
    return "unpaid";
  }

  return "pending";
};

const createProductOrder = async ({ userId, payload, clientIp }) =>
  runInTransaction(async (session) => {
    const orderItems = await buildOrderItems(payload.items, session);
    const totals = calculateTotals(orderItems);
    const orderId = createOrderId();

    const [order] = await Order.create(
      [
        {
          id: orderId,
          userId,
          items: orderItems,
          status: "pending",
          totalAmount: totals.totalAmount,
          shippingFee: totals.shippingFee,
          discount: totals.discount,
          paymentMethod: payload.paymentMethod,
          paymentProvider: payload.paymentMethod,
          paymentStatus: getInitialPaymentStatus(payload.paymentMethod),
          shippingAddress: payload.shippingAddress,
          note: payload.note,
        },
      ],
      { session }
    );

    await OrderStatusHistory.create(
      [
        {
          orderId: order.id,
          status: "pending",
          note: "Đơn hàng đã được tạo",
        },
      ],
      { session }
    );

    await createNotificationOnce(
      {
        userId,
        eventKey: `order-created:${order.id}`,
        title: {
          vi: "Đặt hàng thành công",
          en: "Order placed successfully",
          zh: "订单已创建",
        },
        content: {
          vi: `Đơn hàng ${order.id} đã được ghi nhận.`,
          en: `Order ${order.id} has been recorded.`,
          zh: `订单 ${order.id} 已记录。`,
        },
        type: "order",
        relatedId: order.id,
      },
      session
    );

    const responseData = order.toObject();

    if (payload.paymentMethod === "vnpay") {
      if (!payload.returnUrl) {
        throw new AppError("Return URL is required for VNPay payment", 400, "VNPAY_RETURN_URL_REQUIRED");
      }

      responseData.paymentUrl = createPaymentUrl({
        orderId: order.id,
        amount: totals.totalAmount,
        ipAddr: clientIp,
        orderInfo: `Thanh toan don hang ${order.id}`,
        returnUrl: payload.returnUrl,
      });
    }

    return responseData;
  });

module.exports = {
  createProductOrder,
};
