const Student = require('../models/Student');

function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Faculty)
exports.getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, course, yearLevel, status, email, studentNumber, section, q } = req.query;
    
    const query = {};
    if (course) query.course = course;
    if (yearLevel) query.yearLevel = parseInt(yearLevel);
    if (status) query.status = status;
    if (email) query.email = String(email).toLowerCase();
    if (studentNumber) query.studentNumber = new RegExp(`^${escapeRegExp(studentNumber)}`, 'i');
    if (q) {
      const isDigits = /^\d+$/.test(q);
      // If user typed a numeric query and it's long enough, prefer exact studentNumber match
      if (isDigits && String(q).length >= 6) {
        query.studentNumber = new RegExp(`^${escapeRegExp(q)}$`, 'i');
      } else {
        const reg = new RegExp(escapeRegExp(q), 'i');
        query.$or = [
          { firstName: reg },
          { lastName: reg },
          { studentNumber: reg },
          { email: reg }
        ];
      }
    }
    if (section) query.section = new RegExp(`^${escapeRegExp(section)}$`, 'i');

    const students = await Student.find(query)
      .populate('userId', 'username role createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ lastName: 1, firstName: 1 });

    // Normalize section display to uppercase for consistency
    students.forEach(s => {
      if (s.section) s.section = String(s.section).toUpperCase();
    });

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'username role createdAt')
      .populate('violations.reportedBy', 'firstName lastName');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (student && student.section) student.section = String(student.section).toUpperCase();

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student by user ID (for student portal)
// @route   GET /api/students/profile/me
// @access  Private (Student)
exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('violations.reportedBy', 'firstName lastName');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (student && student.section) student.section = String(student.section).toUpperCase();

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update current student's profile (student self-service)
// @route   PUT /api/students/profile/me
// @access  Private (Student)
exports.updateMyProfile = async (req, res) => {
  try {
    // Normalize section if provided
    if (req.body.section) req.body.section = String(req.body.section).toUpperCase();

    console.log('UpdateMyProfile request by user:', req.user?._id);
    console.log('Payload:', JSON.stringify(req.body));

    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Update my profile error:', error);
    // If validation error, return detailed messages
    if (error.name === 'ValidationError') {
      const details = {};
      for (const key in error.errors) {
        details[key] = error.errors[key].message;
      }
      return res.status(400).json({ success: false, message: 'Validation failed', errors: details });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private (Admin)
exports.createStudent = async (req, res) => {
  try {
    if (req.body.section) req.body.section = String(req.body.section).toUpperCase();
    const student = new Student(req.body);
    await student.save();

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res) => {
  try {
    if (req.body.section) req.body.section = String(req.body.section).toUpperCase();
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete associated user account
    await require('../models/User').findByIdAndDelete(student.userId);
    await student.deleteOne();

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/students/stats
// @access  Private (Admin, Faculty)
exports.getStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });
    const graduatedStudents = await Student.countDocuments({ status: 'graduated' });
    
    const byCourse = await Student.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const byYearLevel = await Student.aggregate([
      { $group: { _id: '$yearLevel', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        graduatedStudents,
        byCourse,
        byYearLevel
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Count students by course, yearLevel, section
// @route   GET /api/students/count?course=&yearLevel=&section=
// @access  Private (Admin, Faculty)
exports.countStudents = async (req, res) => {
  try {
    const { course, yearLevel, section } = req.query;
    const query = {};
    if (course) query.course = course;
    if (yearLevel) query.yearLevel = parseInt(yearLevel);
    if (section) query.section = new RegExp(`^${escapeRegExp(section)}$`, 'i');

    const count = await Student.countDocuments(query);
    res.json({ success: true, count });
  } catch (error) {
    console.error('Count students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
