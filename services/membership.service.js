const MembershipOrder = require("../models/MembershipOrder");
const MembershipPackage = require("../models/MembershipPackage");
const MembershipSubscription = require("../models/MembershipSubscription");
const PointTransaction = require("../models/PointTransaction");
const User = require("../models/User");

const getMembershipLevelFromPackage = (packageId) => {
  if (packageId.includes("diamond")) return "diamond";
  if (packageId.includes("platinum")) return "platinum";
  if (packageId.includes("gold")) return "gold";
  if (packageId.includes("silver")) return "silver";
  return "member";
};

const activateMembershipOrder = async ({ orderId, actorId, session }) => {
  const order = await MembershipOrder.findOne({ id: orderId }).session(session || null);
  if (!order) {
    return null;
  }

  const package_ = await MembershipPackage.findOne({ id: order.packageId }).session(session || null).lean();
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + (package_?.durationDays || 30) * 24 * 60 * 60 * 1000);

  let subscription = await MembershipSubscription.findOne({ orderId: order.id }).session(session || null);

  if (!subscription) {
    const [created] = await MembershipSubscription.create(
      [
        {
          userId: order.userId,
          packageId: order.packageId,
          orderId: order.id,
          packageName: order.packageName,
          price: order.price,
          startDate,
          endDate,
          status: "active",
        },
      ],
      { session }
    );
    subscription = created;
  }

  order.subscriptionId = subscription.id;
  order.status = "completed";
  if (order.paymentStatus !== "paid") {
    order.paymentStatus = "paid";
    order.paidAt = new Date();
  }
  await order.save({ session });

  const user = await User.findOne({ id: order.userId }).session(session || null);
  if (user) {
    user.membershipLevel = getMembershipLevelFromPackage(order.packageId);
    const points = Math.floor(order.price / 10000);
    user.points = (user.points || 0) + points;
    await user.save({ session });

    if (points > 0) {
      await PointTransaction.create(
        [
          {
            userId: user.id,
            points,
            type: "earn",
            reason: "Membership package purchase",
            referenceType: "membership-order",
            referenceId: order.id,
            actorId,
          },
        ],
        { session }
      );
    }
  }

  return subscription.toObject();
};

module.exports = {
  activateMembershipOrder,
  getMembershipLevelFromPackage,
};
