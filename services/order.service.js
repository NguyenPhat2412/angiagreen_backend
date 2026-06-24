const { randomUUID } = require("crypto");
const Order = require("../models/Order");
const OrderStatusHistory = require("../models/OrderStatusHistory");
const MembershipLevel = require("../models/MembershipLevel");
const Product = require("../models/Product");
const User = require("../models/User");
const Voucher = require("../models/Voucher");
const AppError = require("../utils/AppError");
const { createNotificationOnce } = require("../utils/notifications");
const runInTransaction = require("../utils/runInTransaction");
const { createPaymentUrl } = require("../utils/vnpay");
const { ensureInventoryAvailable, reserveInventory } = require("./inventory.service");

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

  const orderItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new AppError(`Không tìm thấy sản phẩm: ${item.productId}`, 404, "PRODUCT_NOT_FOUND");
    }

    if (product.inStock === false) {
      throw new AppError(`Sản phẩm ${getLocalizedProductName(product.name)} hiện đã hết hàng`, 400, "PRODUCT_OUT_OF_STOCK");
    }

    return {
      productId: product.id,
      categoryId: product.categoryId,
      productName: getLocalizedProductName(product.name),
      quantity: item.quantity,
      price: product.price,
      image: product.image,
    };
  });

  for (const item of orderItems) {
    await ensureInventoryAvailable({ productId: item.productId, quantity: item.quantity, session });
  }

  return orderItems;
};

const getActiveVoucher = async (code, items, subtotal, session) => {
  if (!code) {
    return null;
  }

  const voucher = await Voucher.findOne({ code: String(code).trim().toUpperCase(), status: "active" }).session(session || null);
  const now = new Date();

  if (!voucher) {
    throw new AppError("Voucher không tồn tại hoặc đã bị vô hiệu hóa", 404, "VOUCHER_NOT_FOUND");
  }

  if ((voucher.startsAt && voucher.startsAt > now) || (voucher.endsAt && voucher.endsAt < now)) {
    throw new AppError("Voucher không còn hiệu lực", 400, "VOUCHER_EXPIRED");
  }

  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
    throw new AppError("Voucher đã hết lượt sử dụng", 400, "VOUCHER_USAGE_LIMIT");
  }

  if (subtotal < (voucher.minOrderAmount || 0)) {
    throw new AppError("Đơn hàng chưa đạt giá trị tối thiểu của voucher", 400, "VOUCHER_MIN_ORDER");
  }

  const productScope = voucher.applicableProductIds || [];
  const categoryScope = voucher.applicableCategoryIds || [];
  const hasScope = productScope.length > 0 || categoryScope.length > 0;

  if (hasScope) {
    const isApplicable = items.some(
      (item) => productScope.includes(item.productId) || categoryScope.includes(item.categoryId)
    );

    if (!isApplicable) {
      throw new AppError("Voucher không áp dụng cho sản phẩm trong đơn", 400, "VOUCHER_SCOPE_INVALID");
    }
  }

  return voucher;
};

const calculateVoucherDiscount = (voucher, subtotal) => {
  if (!voucher) {
    return 0;
  }

  const rawDiscount = voucher.type === "percent" ? (subtotal * voucher.value) / 100 : voucher.value;
  const cappedDiscount = voucher.maxDiscount ? Math.min(rawDiscount, voucher.maxDiscount) : rawDiscount;
  return Math.min(subtotal, Math.max(0, Math.floor(cappedDiscount)));
};

const getMembershipBenefits = async (userId, session) => {
  const user = await User.findOne({ id: userId }).session(session || null).lean();
  const membershipLevel = user?.membershipLevel || "member";
  const level = await MembershipLevel.findOne({ level: membershipLevel }).session(session || null).lean();

  return {
    membershipLevel,
    discountPercent: level?.discount || 0,
    freeShipping: Boolean(level?.freeShipping),
    pointMultiplier: level?.pointMultiplier || 1,
  };
};

const calculateTotals = async ({ items, userId, voucherCode, session }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const membership = await getMembershipBenefits(userId, session);
  const membershipDiscount = Math.floor((subtotal * membership.discountPercent) / 100);
  const voucher = await getActiveVoucher(voucherCode, items, subtotal, session);
  const voucherDiscount = calculateVoucherDiscount(voucher, Math.max(0, subtotal - membershipDiscount));
  const shippingFee = membership.freeShipping || subtotal > FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
  const discount = membershipDiscount + voucherDiscount;

  return {
    subtotal,
    shippingFee,
    discount,
    membership,
    membershipDiscount,
    voucher,
    voucherDiscount,
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
    const totals = await calculateTotals({
      items: orderItems,
      userId,
      voucherCode: payload.voucherCode,
      session,
    });
    const orderId = createOrderId();

    if (totals.voucher) {
      totals.voucher.usedCount += 1;
      await totals.voucher.save({ session });
    }

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
          voucherCode: totals.voucher?.code,
          voucherId: totals.voucher?.id,
          paymentMethod: payload.paymentMethod,
          paymentProvider: payload.paymentMethod,
          paymentStatus: getInitialPaymentStatus(payload.paymentMethod),
          shippingAddress: payload.shippingAddress,
          note: payload.note,
        },
      ],
      { session }
    );

    await reserveInventory({
      items: orderItems,
      referenceId: order.id,
      actorId: userId,
      session,
    });

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
