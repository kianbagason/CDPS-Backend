const Class = require('../models/Class');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

// Generate unique class code
const generateClassCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let exists = true;
  
  while (exists) {
    code = 'CLASS-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existing = await Class.findOne({ classCode: code });
    exists = !!existing;
  }
  
  return code;
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Faculty)
exports.createClass = async (req, res) => {
  try {
    const { className, description, syllabus, course, yearLevel, section, semester, year } = req.body;

    // Get faculty profile
    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    // Generate unique class code
    const classCode = await generateClassCode();

    const newClass = new Class({
      className,
      description,
      syllabus,
      classCode,
      faculty: faculty._id,
      course,
      yearLevel,
      section,
      semester,
      year
    });

    await newClass.save();

    res.status(201).json({
      success: true,
      data: newClass
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get faculty's classes
// @route   GET /api/classes/faculty
// @access  Private (Faculty)
exports.getFacultyClasses = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    const classes = await Class.find({ faculty: faculty._id })
      .populate('faculty', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    console.error('Get faculty classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student's enrolled classes
// @route   GET /api/classes/student
// @access  Private (Student)
exports.getStudentClasses = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const classes = await Class.find({
      'enrolledStudents.student': student._id,
      'enrolledStudents.status': 'active'
    })
      .populate('faculty', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    console.error('Get student classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
exports.getClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('faculty', 'firstName lastName email')
      .populate('enrolledStudents.student', 'firstName lastName studentNumber course yearLevel');

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classItem
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Enroll student in class using class code
// @route   POST /api/classes/:id/enroll
// @access  Private (Student)
exports.enrollStudent = async (req, res) => {
  try {
    const { classCode } = req.body;

    // Find class by code
    const classItem = await Class.findOne({ classCode });
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Invalid class code'
      });
    }

    if (classItem.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This class is not accepting enrollments'
      });
    }

    // Get student profile
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Check if already enrolled
    const alreadyEnrolled = classItem.enrolledStudents.find(
      es => es.student.toString() === student._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this class'
      });
    }

    // Enroll student
    classItem.enrolledStudents.push({
      student: student._id,
      status: 'active'
    });

    await classItem.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in class',
      data: classItem
    });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get enrolled students for a class
// @route   GET /api/classes/:id/students
// @access  Private (Faculty)
exports.getEnrolledStudents = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('enrolledStudents.student', 'firstName lastName studentNumber email course yearLevel section');

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      count: classItem.enrolledStudents.length,
      data: classItem.enrolledStudents
    });
  } catch (error) {
    console.error('Get enrolled students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Faculty)
exports.updateClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Verify faculty owns this class
    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (classItem.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this class'
      });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedClass
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Faculty)
exports.deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Verify faculty owns this class
    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (classItem.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this class'
      });
    }

    await classItem.deleteOne();

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
