const express = require('express');
const axios = require('axios');
const fs = require('fs');
const auth = require('../middleware/auth'); // Your auth gatekeeper
const File = require('../models/File'); // Your File model

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

// --- GET all documents for the logged-in user ---
// GET /api/documents
router.get('/', auth, async (req, res) => {
  try {
    const documents = await File.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- DELETE a specific document ---
// DELETE /api/documents/:fileId
router.delete('/:fileId', auth, async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const file = await File.findById(fileId);

    // 1. Check if file exists
    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }

    // 2. Check if user owns the file
    if (file.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // 3. Delete vectors from Qdrant
    await axios.post(`${AI_SERVICE_URL}/delete-vectors`, {
      file_id: fileId,
    });

    // 4. Delete the file from the /uploads volume
    fs.unlink(file.path, (err) => {
      if (err) console.error("Error deleting file from disk:", err);
    });

    // 5. Delete metadata from MongoDB
    await File.findByIdAndDelete(fileId);

    res.json({ msg: 'File and associated vectors deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;