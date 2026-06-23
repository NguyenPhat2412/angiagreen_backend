require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");
  const name = String(process.env.ADMIN_NAME || "An Gia Green Admin").trim();
  const phone = String(process.env.ADMIN_PHONE || "").trim();

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  await connectDB();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    existingUser.name = name;
    existingUser.phone = phone || existingUser.phone;
    existingUser.role = "admin";
    if (password) {
      existingUser.password = password;
    }
    await existingUser.save();
    console.log(`Admin user updated: ${email}`);
  } else {
    await User.create({
      name,
      email,
      phone,
      password,
      role: "admin",
    });
    console.log(`Admin user created: ${email}`);
  }
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
