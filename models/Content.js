const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalContent: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['blog', 'youtube', 'podcast', 'tweet'],
    required: true
  },
  repurposedContent: {
    twitter: String,
    linkedin: String,
    instagram: String,
    newsletter: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Content', contentSchema);
