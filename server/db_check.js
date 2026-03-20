const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  console.log('--- Database Connectivity Audit ---');
  console.log('URI:', process.env.MONGO_URI.split('@')[1] ? `******@${process.env.MONGO_URI.split('@')[1]}` : 'MISSING');
  
  try {
    console.log('Connecting to Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connection Successful!');
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Found Collections:', collections.map(c => c.name).join(', '));
    
    // Test a simple query
    const Hall = mongoose.model('Hall', new mongoose.Schema({ name: String }));
    const count = await Hall.countDocuments();
    console.log(`Diagnostic: Found ${count} Halls in CSE database.`);
    
    await mongoose.disconnect();
    console.log('--- Audit Complete ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  }
};

testConnection();
