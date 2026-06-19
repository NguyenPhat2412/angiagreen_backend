require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const loadFrontendData = require("./loadFrontendData");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Doctor = require("../models/Doctor");
const Article = require("../models/Article");
const MembershipLevel = require("../models/MembershipLevel");
const MembershipPackage = require("../models/MembershipPackage");
const { seedContentPages } = require("../modules/content/content.seed");

const upsertMany = async (Model, records, label) => {
  if (!records?.length) {
    console.log(`${label}: no records`);
    return;
  }

  await Model.bulkWrite(
    records.map((record) => ({
      updateOne: {
        filter: { id: record.id },
        update: { $set: record },
        upsert: true,
      },
    }))
  );

  console.log(`${label}: ${records.length} records upserted`);
};

const normalizeMembershipLevels = (levels) =>
  levels.map((level) => ({
    ...level,
    freeShipping: level.freeShipping ?? level.freeShiping ?? false,
  }));

const seed = async () => {
  await connectDB();
  const {
    categories,
    products,
    doctors,
    articles,
    membershipLevels,
    membershipPackages,
  } = loadFrontendData();

  await upsertMany(Category, categories, "Categories");
  await upsertMany(Product, products, "Products");
  await upsertMany(Doctor, doctors, "Doctors");
  await upsertMany(Article, articles, "Articles");
  await upsertMany(MembershipLevel, normalizeMembershipLevels(membershipLevels), "Membership levels");
  await upsertMany(MembershipPackage, membershipPackages, "Membership packages");
  await seedContentPages();

  await mongoose.disconnect();
  console.log("Seed completed");
};

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
