const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
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
  semester: {
    type: String,
    required: true,
    enum: ['1st', '2nd', 'Summer']
  },
  units: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
subjectSchema.index({ course: 1, yearLevel: 1, semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
