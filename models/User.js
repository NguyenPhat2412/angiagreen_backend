const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `addr-${randomUUID()}` },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const paymentMethodSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `pay-${randomUUID()}` },
    type: { type: String, enum: ["cod", "bank", "card", "wallet"], default: "cod" },
    label: { type: String, required: true, trim: true },
    provider: { type: String, trim: true },
    last4: { type: String, trim: true, maxlength: 4 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `user-${randomUUID()}`, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    avatar: String,
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["customer", "doctor", "admin"], default: "customer" },
    status: { type: String, enum: ["active", "locked", "disabled"], default: "active", index: true },
    membershipLevel: {
      type: String,
      enum: ["member", "silver", "gold", "platinum", "diamond"],
      default: "member",
    },
    points: { type: Number, default: 0 },
    addresses: [addressSchema],
    favoriteProductIds: [{ type: String, trim: true }],
    paymentMethods: [paymentMethodSchema],
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
