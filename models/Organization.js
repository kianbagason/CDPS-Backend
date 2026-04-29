const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['organization', 'sports', 'club'],
    default: 'organization'
  },
  // 7-digit numeric code (string to preserve leading zeros), unique identifier
  code: {
    type: String,
    required: false,
    unique: true,
    default: function() {
      return String(Math.floor(1000000 + Math.random() * 9000000));
    }
  },
  // OIC removed: organizations no longer track an Officer In Charge
  members: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected'],
      default: 'pending'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Organization', organizationSchema);
