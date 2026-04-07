const User = require('../models/User');
const Student = require('../models/Student');
const { generateUsername, generatePassword } = require('../utils/generateCredentials');

// Generate student number in format: YY + random 5 digits (e.g., 2203334)
const generateStudentNumber = async () => {
  const currentYear = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of year
  const randomDigits = Math.floor(100000 + Math.random() * 900000).toString(); // 6 random digits
  const studentNumber = currentYear + randomDigits;
  
  // Check if student number already exists
  const exists = await Student.findOne({ studentNumber });
  if (exists) {
    return generateStudentNumber(); // Recursively generate new one
  }
  
  return studentNumber;
};

// @desc    Enroll new student
// @route   POST /api/enrollment/register
// @access  Public
exports.enrollStudent = async (req, res) => {
  try {
    const {
      // Personal Info
      firstName,
      lastName,
      middleName,
      suffix,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      // Academic Info
      course,
      yearLevel,
      section,
      enrollmentYear
    } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ username: email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate student number
    const studentNumber = await generateStudentNumber();
    
    // Generate credentials
    const username = generateUsername(firstName, lastName, studentNumber);
    const password = generatePassword();

    // Create user account
    const user = new User({
      username,
      password,
      role: 'student'
    });

    await user.save();

    // Create student profile
    const student = new Student({
      firstName,
      lastName,
      middleName,
      suffix,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      studentNumber,
      course,
      yearLevel,
      section,
      enrollmentYear,
      userId: user._id
    });

    await student.save();

    // Return credentials (only time password is shown)
    res.status(201).json({
      success: true,
      message: 'Enrollment successful! Please save your credentials.',
      data: {
        username,
        password,
        studentNumber,
        warning: 'Save these credentials now. You will not be able to see your password again.'
      }
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during enrollment',
      error: error.message
    });
  }
};

// @desc    Check if student number exists
// @route   GET /api/enrollment/check/:studentNumber
// @access  Public
exports.checkStudentNumber = async (req, res) => {
  try {
    const { studentNumber } = req.params;
    const exists = await Student.findOne({ studentNumber });
    
    res.json({
      success: true,
      exists: !!exists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
