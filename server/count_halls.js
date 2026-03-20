const mongoose = require('mongoose');
require('dotenv').config();
const Hall = require('./models/Hall');

console.log('Counting halls in database...');
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    const count = await Hall.countDocuments();
    console.log(`VERIFIED: Found ${count} halls.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('VERIFIED: FAILURE!', err.message);
    process.exit(1);
  });
