const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Check if admin already exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists. Updating password...');
      const hashedPassword = await bcrypt.hash('psna123', 10);
      adminExists.password = hashedPassword;
      await adminExists.save();
      console.log('Admin password updated successfully!');
    } else {
      const hashedPassword = await bcrypt.hash('psna123', 10);
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created successfully!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
