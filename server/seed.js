const mongoose = require('mongoose');
require('dotenv').config();
const Hall = require('./models/Hall');

const halls = [
  { hallName: 'CS104', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS105', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS201', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS202', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS205', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS206', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS208', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS209', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS210', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS211', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS301', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS302', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS305', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS306', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS308', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS309', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS310', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS311', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS313', capacity: 40, block: 'CSE Block' },
  { hallName: 'CS314', capacity: 40, block: 'CSE Block' },
  { hallName: 'GFLAB', capacity: 40, block: 'Lab Complex' },
  { hallName: 'FFLAB', capacity: 40, block: 'Lab Complex' },
  { hallName: 'SFLAB', capacity: 40, block: 'Lab Complex' }
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
