const mongoose = require('mongoose');
require('dotenv').config();
const { getExamModel } = require('./models/Exam');

const checkDates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const depts = ['CSE', 'AIDS', 'CSBS'];
        for (const dept of depts) {
            const Exam = getExamModel(dept);
            const exams = await Exam.find().sort({ createdAt: -1 }).limit(10);
            console.log(`\nDept: ${dept}`);
            exams.forEach(e => {
                const isStandard = /^\d{4}-\d{2}-\d{2}$/.test(e.date);
                console.log(` - [${isStandard ? 'OK' : 'INVALID'}] ID: ${e._id}, Date: "${e.date}", Name: ${e.name}`);
            });
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkDates();
