const asyncHandler = require("../middlewares/asyncHandler");
const Appointment = require("../models/Appointment");
const MembershipOrder = require("../models/MembershipOrder");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const startOfDay = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDashboard = asyncHandler(async (_req, res) => {
  const today = startOfDay();

  const [
    totalRevenue,
    membershipRevenue,
    pendingOrders,
    newOrdersToday,
    pendingAppointments,
    newCustomersToday,
    totalCustomers,
    totalProducts,
    topProducts,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { $or: [{ paymentStatus: "paid" }, { status: "delivered" }] } },
      { $group: { _id: null, value: { $sum: "$totalAmount" } } },
    ]),
    MembershipOrder.aggregate([
      { $match: { $or: [{ paymentStatus: "paid" }, { status: "completed" }] } },
      { $group: { _id: null, value: { $sum: "$price" } } },
    ]),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Appointment.countDocuments({ status: "pending" }),
    User.countDocuments({ role: "customer", createdAt: { $gte: today } }),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments(),
    Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]),
  ]);

  res.json({
    revenue: (totalRevenue[0]?.value || 0) + (membershipRevenue[0]?.value || 0),
    pendingOrders,
    newOrdersToday,
    pendingAppointments,
    newCustomersToday,
    totalCustomers,
    totalProducts,
    topProducts,
  });
});

module.exports = {
  getDashboard,
};
