const mongoose = require('mongoose');

const instructionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['syllabus', 'lesson', 'curriculum'],
    required: true
  },
  course: {
    type: String,
    required: true,
    enum: ['BSIT', 'BSCS', 'BSIS', 'ACT']
  },
  subjectCode: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  fileUrl: String,
  semester: {
    type: String,
    enum: ['1st', '2nd', 'Summer'],
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  }
}, {
  timestamps: true
});

instructionSchema.index({ type: 1, course: 1 });
instructionSchema.index({ subjectCode: 1 });

module.exports = mongoose.model('Instruction', instructionSchema);
