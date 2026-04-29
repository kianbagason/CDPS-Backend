const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  syllabus: {
    type: String,
    trim: true
  },
  classCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  course: {
    type: String,
    required: true,
    enum: ['BSIT', 'BSCS']
  },
  yearLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    required: true,
    enum: ['1st', '2nd', 'Summer']
  },
  year: {
    type: Number,
    required: true
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for faster queries
// Note: classCode already has index: true in field definition
classSchema.index({ faculty: 1, status: 1 });

module.exports = mongoose.model('Class', classSchema);
