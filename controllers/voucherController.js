const asyncHandler = require("../middlewares/asyncHandler");
const Voucher = require("../models/Voucher");
const { escapeRegex, getPagination, toPaginatedResponse } = require("../utils/query");

const calculateDiscount = (voucher, subtotal) => {
  const rawDiscount = voucher.type === "percent" ? (subtotal * voucher.value) / 100 : voucher.value;
  const cappedDiscount = voucher.maxDiscount ? Math.min(rawDiscount, voucher.maxDiscount) : rawDiscount;
  return Math.min(subtotal, Math.max(0, Math.floor(cappedDiscount)));
};

const validateVoucherState = (voucher, subtotal) => {
  const now = new Date();

  if (!voucher || voucher.status !== "active") {
    return "Voucher is inactive";
  }

  if ((voucher.startsAt && voucher.startsAt > now) || (voucher.endsAt && voucher.endsAt < now)) {
    return "Voucher is expired";
  }

  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
    return "Voucher usage limit reached";
  }

  if (subtotal < (voucher.minOrderAmount || 0)) {
    return "Order does not meet voucher minimum amount";
  }

  return "";
};

const getVouchers = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const safeSearch = escapeRegex(query.search);
    filter.$or = [
      { code: { $regex: safeSearch, $options: "i" } },
      { "name.vi": { $regex: safeSearch, $options: "i" } },
      { "name.en": { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Voucher.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Voucher.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(items, { page, limit }, total));
});

const createVoucher = asyncHandler(async (req, res) => {
  const voucher = await Voucher.create(req.body);
  res.status(201).json(voucher);
});

const updateVoucher = asyncHandler(async (req, res) => {
  const voucher = await Voucher.findOneAndUpdate({ id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!voucher) {
    res.status(404);
    throw new Error("Voucher not found");
  }

  res.json(voucher);
});

const disableVoucher = asyncHandler(async (req, res) => {
  const voucher = await Voucher.findOneAndUpdate(
    { id: req.params.id },
    { status: "inactive" },
    { new: true, runValidators: true }
  ).lean();

  if (!voucher) {
    res.status(404);
    throw new Error("Voucher not found");
  }

  res.json(voucher);
});

const applyVoucher = asyncHandler(async (req, res) => {
  const voucher = await Voucher.findOne({ code: req.body.code }).lean();
  const reason = validateVoucherState(voucher, req.body.subtotal);

  if (reason) {
    res.status(400);
    throw new Error(reason);
  }

  res.json({
    voucher,
    discount: calculateDiscount(voucher, req.body.subtotal),
  });
});

module.exports = {
  applyVoucher,
  createVoucher,
  disableVoucher,
  getVouchers,
  updateVoucher,
};
