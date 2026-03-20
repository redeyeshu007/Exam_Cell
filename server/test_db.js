const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('VERIFIED: SUCCESS! Database is accessible.');
    process.exit(0);
  })
  .catch(err => {
    console.error('VERIFIED: FAILURE! Still cannot connect:', err.message);
    process.exit(1);
  });
