const mongoose = require('mongoose');
require('dotenv').config();
const Hall = require('./models/Hall');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const halls = await Hall.find();
    console.log(JSON.stringify(halls, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
