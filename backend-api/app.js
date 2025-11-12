const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const multer = require('multer');
const { Redis } = require('ioredis');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const authMiddleware = require('./middleware/auth');
const fs = require('fs'); // <-- ADD THIS
const User = require('./models/User'); // (You should already have this)
const File = require('./models/File'); // <-- ADD THIS

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON bodies
const PORT = 5000;

// --- Environment Variables ---
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
const MONGO_URI = process.env.MONGO_URI;
const REDIS_HOST = process.env.REDIS_HOST;

// --- Database (MongoDB) ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Simple Schema for file metadata
// const fileSchema = new mongoose.Schema({
//   filename: String,
//   originalName: String,
//   path: String,
//   status: { type: String, default: 'PENDING' },
//   createdAt: { type: Date, default: Date.now }
// });
// const File = mongoose.model('File', fileSchema);

// --- Message Queue (Redis) ---
const redis = new Redis({ host: REDIS_HOST });
const REDIS_CHANNEL = 'file-ingestion';

// --- File Upload (Multer) ---
// We save to the shared volume path
const upload = multer({ dest: '/app/uploads/' });

// ==================
//      API ROUTES
// ==================
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes); // <-- ADD THIS

// 1. A simple test route (from before)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from the Node.js API!' });
});

// 2. A route to test the connection to the Python AI Worker (from before)
app.get('/api/test-ai', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/test`);
    res.json({ message: response.data.message });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to AI service', error: error.message });
  }
});

// 3. NEW: File Upload Endpoint
app.post('/api/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    // 1. Create metadata in MongoDB
    const file = new File({
      filename: req.file.filename, // Multer's unique name
      originalName: req.file.originalname,
      path: req.file.path ,
      userId: req.user.id
    });
    await file.save();

    // 2. Publish job to Redis
    const job = {
      fileId: file.id,
      filePath: file.path,
      originalName: file.originalName,
      userId: req.user.id
    };
    await redis.publish(REDIS_CHANNEL, JSON.stringify(job));

    console.log(`Published job for file: ${file.originalName}`);
    
    // 202 Accepted: The request is accepted and will be processed.
    res.status(202).json({ 
      message: "File uploaded and is being processed.", 
      fileId: file.id 
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).send("Error processing file upload.");
  }
});

// ... (all your other code: imports, mongo, redis, upload route, etc.) ...

// 4. NEW: Query Endpoint
app.post('/api/query', authMiddleware, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).send('No question provided.');
    }

    // Forward the question to the Python AI Service
    // AI_SERVICE_URL is 'http://ai_worker:8000'
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/query`, {
      question: question,
      userId: req.user.id
    });

    // Send the AI's answer back to the React frontend
    res.status(200).json(aiResponse.data);

  } catch (error) {
    console.error('Query error:', error.message);
    res.status(500).send("Error processing query.");
  }
});

app.listen(PORT, () => {
  console.log(`Backend API listening on port ${PORT}`);
});