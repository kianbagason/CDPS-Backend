const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  course: {
    type: String,
    required: true,
    enum: ['BSIT', 'BSCS', 'BSIS', 'ACT']
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  subjectCode: {
    type: String,
    required: true,
    trim: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  room: {
    type: String,
    required: true,
    trim: true
  },
  lab: {
    type: Boolean,
    default: false
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    enum: ['1st', '2nd', 'Summer'],
    required: true
  },
  year: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for conflict detection
scheduleSchema.index({ faculty: 1, day: 1, room: 1 });
scheduleSchema.index({ course: 1, section: 1, semester: 1, year: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
