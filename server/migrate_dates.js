const mongoose = require('mongoose');
require('dotenv').config();
const { getExamModel } = require('./models/Exam');

const migrateDates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const depts = ['CSE', 'AIDS', 'CSBS'];
        let totalUpdated = 0;

        for (const dept of depts) {
            const Exam = getExamModel(dept);
            const exams = await Exam.find();
            console.log(`Processing ${dept}...`);

            for (const exam of exams) {
                let originalDate = exam.date;
                let newDate = originalDate;

                // Case 1: DD-MM-YYYY or DD-MM-YY
                if (/^\d{1,2}-\d{1,2}-\d{2,4}$/.test(originalDate)) {
                    let parts = originalDate.split('-');
                    let d, m, y;
                    if (parts[0].length === 4) { // YYYY-MM-DD (but maybe something is off)
                        [y, m, d] = parts;
                    } else if (parts[2].length >= 2) { // DD-MM-YY(YY)
                        [d, m, y] = parts;
                        if (y.length === 2) y = '20' + y;
                    } else { // Fallback YY-MM-DD?
                        [y, m, d] = parts;
                        if (y.length === 2) y = '20' + y;
                    }
                    newDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                } 
                // Case 2: DD/MM/YYYY or DD/MM/YY
                else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(originalDate)) {
                    let parts = originalDate.split('/');
                    let d, m, y;
                    if (parts[0].length === 4) {
                        [y, m, d] = parts;
                    } else {
                        [d, m, y] = parts;
                        if (y.length === 2) y = '20' + y;
                    }
                    newDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                }
                // Case 3: Mixed or malformed?
                else if (originalDate.includes('T')) { // ISO Date
                    newDate = originalDate.split('T')[0];
                }

                if (newDate !== originalDate) {
                    exam.date = newDate;
                    await exam.save();
                    totalUpdated++;
                    console.log(` - Updated ${exam.name}: ${originalDate} -> ${newDate}`);
                }
            }
        }
        console.log(`\nMigration Complete. Total records updated: ${totalUpdated}`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrateDates();
