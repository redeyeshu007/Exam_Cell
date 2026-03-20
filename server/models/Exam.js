const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  session: { type: String, enum: ['FN', 'AN'], required: true },
  dept: { type: String, required: true },
  halls: { type: [String], required: true },
  allocatedHalls: {
    type: [{
      hall: { type: String, required: true },
      faculty: { type: String, default: '' }
    }],
    default: []
  }
}, { timestamps: true });

// Function to get/create a department-specific Exam model
const getExamModel = (dept) => {
  const collectionName = `Exams_${dept}`;
  return mongoose.models[collectionName] || mongoose.model(collectionName, examSchema, collectionName);
};

module.exports = { getExamModel };
