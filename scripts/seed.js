// scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');
const Task = require('../src/models/Task');
const Auth = require('../src/models/Auth');
const connectDB = require('../src/config/db');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Starting database seed...');

    const existingUsers = await User.countDocuments();
    const existingTasks = await Task.countDocuments();
    const existingAuths = await Auth.countDocuments();

    let user;
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);

    // --- AUTH SEEDING ---

    if (existingAuths === 0) {
      console.log('No auth records found. Creating demo auth record...');
      const hashed = await bcrypt.hash('password123', saltRounds);

      const auth = new Auth({
        name: 'Demo Auth',
        email: 'demoAuth@example.com',
        username: 'demo.auth',
        password: hashed,
      });
      await auth.save();
      console.log(`Created demo auth record: ${auth.username}`);
    } else {
      console.log(`Found ${existingAuths} existing auth record(s). Skipping auth seeding.`);
    }

    // --- USER SEEDING ---
    if (existingUsers === 0) {
      console.log('No users found. Creating demo user...');
      const hashed = await bcrypt.hash('password123', saltRounds);

      user = new User({
        name: 'Demo User',
        username: 'demo.user',
        email: 'demo@example.com',
        password: hashed,
      });
      await user.save();
      console.log(`Created demo user: ${user.username}`);
    } else {
      console.log(`Found ${existingUsers} existing user(s). Skipping user seeding.`);
      user = await User.findOne();
    }

    // --- TASK SEEDING ---
    if (existingTasks === 0) {
      console.log('No tasks found. Creating demo tasks...');

      const tasks = [
        {
          owner: user._id,
          title: 'Sample Task 1',
          description: 'First demo task for testing.',
          status: 'todo',
        },
        {
          owner: user._id,
          title: 'Sample Task 2',
          description: 'Second demo task - in progress.',
          status: 'in-progress',
        },
        {
          owner: user._id,
          title: 'Sample Task 3',
          description: 'Third demo task - done.',
          status: 'done',
        },
      ];

      await Task.insertMany(tasks);
      console.log(`Created ${tasks.length} demo tasks.`);
    } else {
      console.log(`Found ${existingTasks} existing task(s). Skipping task seeding.`);
    }

    console.log('Seed complete!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
