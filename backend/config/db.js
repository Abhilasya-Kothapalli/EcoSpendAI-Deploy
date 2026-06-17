const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const connectDB = async () => {
  try {
    console.log("MONGO_URI =", process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await seedMockUsers();
  } catch (error) {
    console.error("FULL ERROR:");
    console.error(error);
    process.exit(1);
  }
};

const seedMockUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding mock users...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const mockUsers = [
        {
          name: 'Aarav Mehta',
          email: 'aarav@ecospend.ai',
          password: hashedPassword,
          totalSavings: 4500,
          totalCarbonOffset: 120.5,
          ecoPoints: 850,
          weeklyScore: 94
        },
        {
          name: 'Priya Sharma',
          email: 'priya@ecospend.ai',
          password: hashedPassword,
          totalSavings: 6200,
          totalCarbonOffset: 154.2,
          ecoPoints: 1100,
          weeklyScore: 98
        },
        {
          name: 'Kabir Singh',
          email: 'kabir@ecospend.ai',
          password: hashedPassword,
          totalSavings: 2800,
          totalCarbonOffset: 75.8,
          ecoPoints: 520,
          weeklyScore: 82
        },
        {
          name: 'Diya Patel',
          email: 'diya@ecospend.ai',
          password: hashedPassword,
          totalSavings: 5100,
          totalCarbonOffset: 140.0,
          ecoPoints: 960,
          weeklyScore: 91
        }
      ];

      await User.insertMany(mockUsers);
      console.log('Mock users seeded successfully!');
    } else {
      console.log('Database already populated, skipping seed.');
    }
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
  }
};

module.exports = connectDB;
