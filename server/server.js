const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { getExamModel } = require('./models/Exam');
const Hall = require('./models/Hall');
const User = require('./models/User');

const app = express();

// Security Headers (relaxed for dev compatibility)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  frameguard: false
}));

// Flexible CORS for production
app.use(cors({
  origin: process.env.CLIENT_URL || true, // Trust CLIENT_URL or all origins in dev
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-dept-name', 'Bypass-Tunnel-Reminder']
}));

app.use(express.json());

// Enhanced Connection Logic with Diagnostics
const connectDB = async () => {
  console.log('Attempting to connect to MongoDB Atlas...');
  
  const connectionTimeout = setTimeout(() => {
    console.log('\n[DIAGNOSTIC] Connection is taking longer than usual...');
    console.log('TIP: This is usually due to your IP address not being whitelisted in MongoDB Atlas.');
    console.log('ACTION REQUIRED:');
    console.log('1. Log in to MongoDB Atlas (https://cloud.mongodb.com)');
    console.log('2. Go to "Network Access" on the left sidebar');
    console.log('3. Click "Add IP Address" -> "Add Current IP Address"');
    console.log('4. Ensure your password in the .env file is also correct.\n');
  }, 10000);

  try {
    await mongoose.connect(process.env.MONGO_URI, {
       serverSelectionTimeoutMS: 30000, // wait up to 30s
    });
    clearTimeout(connectionTimeout);
    console.log('✅ MongoDB Atlas Connected Successfully');
  } catch (err) {
    clearTimeout(connectionTimeout);
    console.error('❌ MongoDB Connection Error:', err.message);
    if (err.message.includes('authentication failed')) {
      console.error('TIP: Check your database password in the .env file!');
    }
  }
};


// Middleware to get correct exam model from query or header
const getModel = (req) => {
  const dept = req.headers['x-dept-name'] || req.query.dept || 'GENERAL';
  return getExamModel(dept.toUpperCase());
};

app.get('/', (req, res) => {
  res.send('Exam Cell API Server is Running');
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In a full implementation, you'd return a JWT here.
    // For now, we'll return the user info to match the existing frontend pattern.
    const userResponse = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    res.json(userResponse);
  } catch (err) {
    console.error('[AUTH ERROR] /api/auth/login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API Routes
app.get('/api/halls', async (req, res) => {
  try {
    const halls = await Hall.find();
    res.json(halls);
  } catch (err) {
    console.error('[SERVER ERROR] /api/halls:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/exams', async (req, res) => {
  try {
    const Exam = getModel(req);
    const newExam = new Exam(req.body);
    await newExam.save();
    res.status(201).json(newExam);
  } catch (err) {
    console.error(`[SERVER ERROR] ${req.method} ${req.path}:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/exams', async (req, res) => {
  try {
    const Exam = getModel(req);
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/exams/:id/allocate', async (req, res) => {
  try {
    const Exam = getModel(req);
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Map the allocated objects to get just the hall names for filtering (handles mixed types)
    const allocatedHallNames = exam.allocatedHalls.map(ah => typeof ah === 'string' ? ah : ah.hall);
    const availableHalls = exam.halls.filter(h => !allocatedHallNames.includes(h));
    
    if (availableHalls.length === 0) {
      return res.status(400).json({ message: 'All scheduled halls completed' });
    }

    // High-entropy Fisher-Yates Shuffle to ensure truly random order
    const shuffledHalls = [...availableHalls];
    for (let i = shuffledHalls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledHalls[i], shuffledHalls[j]] = [shuffledHalls[j], shuffledHalls[i]];
    }
    
    // Pick the first one from the shuffled array
    const selectedHallName = shuffledHalls[0];

    // Push as object with empty faculty initially
    exam.allocatedHalls.push({ hall: selectedHallName, faculty: "" });
    await exam.save();

    res.json({ hall: selectedHallName, exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update faculty for a specific hall in an exam
app.put('/api/exams/:id/faculty', async (req, res) => {
  try {
    const { hall, faculty } = req.body;
    const Exam = getModel(req);
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Find the record in the allocatedHalls array and update it
    const hallIndex = exam.allocatedHalls.findIndex(ah => {
      const hallName = typeof ah === 'string' ? ah : ah.hall;
      return hallName === hall;
    });

    if (hallIndex > -1) {
      const existing = exam.allocatedHalls[hallIndex];
      // Convert to object if it was a legacy string
      if (typeof existing === 'string') {
        exam.allocatedHalls[hallIndex] = { hall: existing, faculty: faculty || "" };
      } else {
        exam.allocatedHalls[hallIndex].faculty = faculty || "";
      }
      
      exam.markModified('allocatedHalls');
      await exam.save();
    }

    res.json(exam);
  } catch (err) {
    console.error(`[SERVER ERROR] ${req.method} ${req.path}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// Delete all exams for a department
app.delete('/api/exams/clear', async (req, res) => {
  try {
    const Exam = getModel(req);
    await Exam.deleteMany({});
    res.json({ message: 'History cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a single exam
app.delete('/api/exams/:id', async (req, res) => {
  try {
    const Exam = getModel(req);
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exam deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an exam
app.put('/api/exams/:id', async (req, res) => {
  try {
    const Exam = getModel(req);
    const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedExam) return res.status(404).json({ message: 'Exam not found' });
    res.json(updatedExam);
  } catch (err) {
    console.error(`[SERVER ERROR] ${req.method} ${req.path}:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const Exam = getModel(req);
    const totalExams = await Exam.countDocuments();
    const exams = await Exam.find();
    const totalHallsUsed = exams.reduce((acc, curr) => acc + curr.allocatedHalls.length, 0);
    res.json({ totalExams, totalHallsUsed });
  } catch (err) {
    console.error('[SERVER ERROR] /api/stats:', err);
    res.status(500).json({ message: err.message });
  }
});

const start = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT} (Listening on 0.0.0.0)`));
};

start();
