const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['assignment', 'quiz', 'exam', 'project', 'activity'],
    default: 'assignment'
  },
  attachments: [{
    type: String
  }],
  maxScore: {
    type: Number,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Index for faster queries
activitySchema.index({ class: 1, status: 1 });
activitySchema.index({ dueDate: 1 });

module.exports = mongoose.model('Activity', activitySchema);
