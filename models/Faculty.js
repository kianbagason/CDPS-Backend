const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
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
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^\+639\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number! Phone must start with +639 followed by 9 digits`
    }
  },
  department: {
    type: String,
    required: true,
    default: 'CCS'
  },
  position: {
    type: String,
    required: true,
    trim: true
  },

  // Subjects handled
  subjects: [{
    subjectCode: String,
    subjectName: String,
    semester: {
      type: String,
      enum: ['1st', '2nd', 'Summer']
    },
    year: Number
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

// Indexes for query optimization (removed duplicate facultyId index)
facultySchema.index({ department: 1 });

module.exports = mongoose.model('Faculty', facultySchema);
