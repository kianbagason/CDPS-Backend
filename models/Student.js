const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  suffix: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },

  // Academic Information
  studentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
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
  enrollmentYear: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'graduated', 'dropped', 'leave'],
    default: 'active'
  },

  // Academic History
  academicHistory: [{
    subject: String,
    subjectCode: String,
    grade: String,
    semester: {
      type: String,
      enum: ['1st', '2nd', 'Summer']
    },
    year: Number,
    status: {
      type: String,
      enum: ['passed', 'failed', 'incomplete', 'dropped'],
      default: 'passed'
    }
  }],

  // Skills
  skills: [{
    skillName: {
      type: String,
      required: true
    },
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    certification: String,
    dateAcquired: Date
  }],

  // Affiliations (school orgs/groups)
  affiliations: [{
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['Member', 'Officer', 'President', 'Treasurer', 'Secretary'],
      default: 'Member'
    },
    dateJoined: {
      type: Date,
      default: Date.now
    }
  }],

  
  // Non-Academic Activities
  nonAcademicActivities: [{
    activityName: {
      type: String,
      required: true
    },
    type: String,
    role: String,
    date: Date,
    description: String,
    certificate: String
  }],

  // Violations
  violations: [{
    violationType: {
      type: String,
      required: true
    },
    description: String,
    message: String,
    date: {
      type: Date,
      default: Date.now
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty'
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'appealed'],
      default: 'pending'
    },
    sanction: String
  }],

  // Reference to User account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for query performance
// Indexes for query optimization (removed duplicate studentNumber index)
studentSchema.index({ skills: 1 });
studentSchema.index({ affiliations: 1 });
studentSchema.index({ course: 1, yearLevel: 1 });

module.exports = mongoose.model('Student', studentSchema);
