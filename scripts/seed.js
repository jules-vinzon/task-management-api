// scripts/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../src/models/User");
const Task = require("../src/models/Task");
const UserKey = require("../src/models/UserKey");
const UserToken = require("../src/models/UserToken");
const connectDB = require("../src/config/db");
const { generateKeyPair } = require("../src/helpers/cryptoUtils");

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("Starting database seed...");

    const existingUsers = await User.countDocuments();
    const existingTasks = await Task.countDocuments();
    const existingKeys = await UserKey.countDocuments();
    const existingUserTokens = await UserToken.countDocuments();

    let user;
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);

    // --- USER SEEDING ---
    if (existingUsers === 0) {
      console.log("No users found. Creating demo user...");
      const hashed = await bcrypt.hash("password123", saltRounds);

      user = new User({
        name: "Demo User",
        username: "demo.user",
        email: "demo@example.com",
        password: hashed,
        created_at: new Date(),
      });
      await user.save();
      console.log(`Created demo user: ${user.username}`);
    } else {
      console.log(
        `Found ${existingUsers} existing user(s). Skipping user seeding.`
      );
      user = await User.findOne();
    }

    // --- TASK SEEDING ---
    if (existingTasks === 0) {
      console.log("No tasks found. Creating demo tasks...");

      const tasks = [
        {
          owner: user._id,
          title: "Sample Task 1",
          description: "First demo task for testing.",
          status: "Pending",
          created_at: new Date(),
        },
        {
          owner: user._id,
          title: "Sample Task 2",
          description: "Second demo task - in progress.",
          status: "Ongoing",
          created_at: new Date(),
        },
        {
          owner: user._id,
          title: "Sample Task 3",
          description: "Third demo task - done.",
          status: "Completed",
          created_at: new Date(),
        },
      ];

      await Task.insertMany(tasks);
      console.log(`Created ${tasks.length} demo tasks.`);
    } else {
      console.log(
        `Found ${existingTasks} existing task(s). Skipping task seeding.`
      );
    }

    // --- USER_TOKEN SEEDING ---

    if (existingUserTokens === 0) {
      console.log("No user tokens found. Creating demo user token...");

      const demoToken = new UserToken({
        user_id: user._id,
        token: "demo_token_12345",
      });

      await demoToken.save();
      console.log("Created demo user token:", demoToken.token);
    } else {
      console.log(
        `Found ${existingUserTokens} existing user token(s). Skipping user token seeding.`
      );
    }

    // --- USER_KEY SEEDING ---
    if (existingKeys === 0) {
      console.log("No user keys found. Creating demo user key...");

      const { publicKey, privateKey } = await generateKeyPair();

      const demoKey = new UserKey({
        request_id: `TSKMNGMNT_${Date.now()}`,
        public_key: publicKey,
        private_key: privateKey,
      });

      await demoKey.save();
      console.log("Created demo user key:", demoKey.public_key);
    } else {
      console.log(
        `Found ${existingKeys} existing user key(s). Skipping user key seeding.`
      );
    }

    console.log("Seed complete!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
