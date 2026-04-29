const mongoose = require('mongoose');

const affiliationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: false
  },
  role: {
    type: String,
    enum: ['member', 'officer', 'president', 'treasurer', 'secretary'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'graduated'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  achievements: [{
    title: String,
    description: String,
    date: Date,
    certificate: String
  }],
  responsibilities: [String],
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Ensure either organizationId or groupId is provided (but not both)
affiliationSchema.pre('save', function(next) {
  if (!this.organizationId && !this.groupId) {
    return next(new Error('Either organizationId or groupId must be provided'));
  }
  if (this.organizationId && this.groupId) {
    return next(new Error('Cannot belong to both organization and group in same affiliation'));
  }
  next();
});

// Indexes for better performance
affiliationSchema.index({ studentId: 1 });
affiliationSchema.index({ organizationId: 1 });
affiliationSchema.index({ groupId: 1 });
affiliationSchema.index({ status: 1 });

module.exports = mongoose.model('Affiliation', affiliationSchema);
