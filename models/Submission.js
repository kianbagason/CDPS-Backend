const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'late', 'graded', 'returned'],
    default: 'submitted'
  },
  score: {
    type: Number,
    min: 0
  },
  feedback: {
    type: String,
    trim: true
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  gradedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure one submission per student per activity
submissionSchema.index({ activity: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
