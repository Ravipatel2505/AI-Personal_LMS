const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  path: String,
  status: { type: String, default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },

  // This is the critical field for multi-tenancy
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('File', fileSchema);