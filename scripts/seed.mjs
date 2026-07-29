import { config } from "dotenv";
config({ path: new URL("../.env.local", import.meta.url).pathname });
import mongoose from "mongoose";
import User from "../lib/models/User.js";
import Profile from "../lib/models/Profile.js";
import defaultProfile from "../data/profileSeedData.js";

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set (check .env.local)");
  await mongoose.connect(process.env.MONGO_URI);

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create({ username: "Admin", password: "Admin@123" });
    console.log("Default admin user created  ->  Admin / Admin@123");
  }

  const profileCount = await Profile.countDocuments();
  if (profileCount === 0) {
    await Profile.create(defaultProfile);
    console.log("Profile seeded with default portfolio data");
  }

  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
