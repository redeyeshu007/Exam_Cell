const mongoose = require('mongoose');
require('dotenv').config();
const Hall = require('./models/Hall');

const halls = [
  { hallName: 'Hall 1', capacity: 30 },
  { hallName: 'Hall 2', capacity: 30 },
  { hallName: 'Hall 3', capacity: 30 },
  { hallName: 'Hall 4', capacity: 30 },
  { hallName: 'Hall 5', capacity: 30 },
  { hallName: 'Hall 6', capacity: 30 },
  { hallName: 'Hall 7', capacity: 30 },
  { hallName: 'Hall 8', capacity: 30 },
  { hallName: 'Hall 9', capacity: 30 },
  { hallName: 'Hall 10', capacity: 30 },
  { hallName: 'Hall 11', capacity: 30 },
  { hallName: 'Hall 12', capacity: 30 },
];

const seedDB = async () => {
  console.log('Connecting to MongoDB for seeding...');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected! Checking for existing halls...');
    
    const existingCount = await Hall.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} halls. Skipping seed.`);
    } else {
      console.log('Database empty. Seeding halls...');
      await Hall.insertMany(halls);
      console.log('✅ Seeding completed successfully!');
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
