const User = require('../models/User');
const Student = require('../models/Student');
const { generateUsername, generatePassword } = require('../utils/generateCredentials');

// Utility to safely build a case-insensitive RegExp for exact-match email searches
function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

    // Basic server-side validation
    const requiredFields = ['firstName', 'lastName', 'email', 'dateOfBirth', 'gender', 'address', 'course', 'yearLevel'];
    for (const f of requiredFields) {
      if (!req.body[f] || String(req.body[f]).trim() === '') {
        return res.status(400).json({ success: false, message: `${f} is required` });
      }
    }

    // Validate email format
    const emailTrim = String(email || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    // Validate minimum age 15
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid dateOfBirth' });
      }
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 15) {
        return res.status(400).json({ success: false, message: 'Student must be at least 15 years old' });
      }
    }

    // Check if email already exists (case-insensitive)
    const existingEmail = await User.findOne({ username: new RegExp(`^${escapeRegExp(emailTrim)}$`, 'i') });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Normalize yearLevel
    const year = parseInt(yearLevel, 10) || 1;

    // If enrolling to year > 1, try to find their 1st-year record by email and use that section
    let resolvedSection = section;
    if (year > 1) {
      // Perform a case-insensitive exact-match on email to avoid missing records
      const emailQuery = new RegExp(`^${escapeRegExp(email)}$`, 'i');
      const firstYearRecord = await Student.findOne({ email: emailQuery, yearLevel: 1 });
        if (firstYearRecord) {
        resolvedSection = firstYearRecord.section;
      } else {
        // If no first-year record and no section provided, ask the client to provide section
        if (!resolvedSection || String(resolvedSection).trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'No 1st-year record found for this email. Please provide the section for the current year.'
          });
        }
      }
    }

    // Normalize and prepare section value (store uppercase)
    const targetSection = String((resolvedSection || section || '')).trim().toUpperCase();

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

    // Ensure section is taken from resolvedSection (may be updated)
    // Enforce section capacity: max 55 per course/year/section
    // Count documents for the target section in a case-insensitive way
    const count = await Student.countDocuments({ course, yearLevel: year, section: new RegExp(`^${escapeRegExp(targetSection)}$`, 'i') });
    const MAX_SLOT = 55;
    if (count >= MAX_SLOT) {
      return res.status(400).json({
        success: false,
        message: `Section ${targetSection} for year ${year} is full (max ${MAX_SLOT} students). Please choose a different section.`
      });
    }

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
      yearLevel: year,
      section: targetSection,
      enrollmentYear,
      userId: user._id
    });

    await student.save();

    // Create a notification for the newly created student to remind them to update credentials
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: user._id,
        message: 'Please update your credentials upon logging in.'
      });
    } catch (notifErr) {
      console.error('Failed to create enrollment notification:', notifErr);
    }

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

// @desc Get count and remaining slots for a given course/year/section (public)
// @route GET /api/enrollment/section-count?course=&yearLevel=&section=
// @access Public
exports.getSectionCount = async (req, res) => {
  try {
    const { course, yearLevel, section } = req.query;
    const query = {};
    if (course) query.course = course;
    if (yearLevel) query.yearLevel = parseInt(yearLevel);
    if (section) query.section = new RegExp(`^${escapeRegExp(section)}$`, 'i');

    const count = await require('../models/Student').countDocuments(query);
    const MAX_SLOT = 55;
    const remaining = Math.max(0, MAX_SLOT - count);

    res.json({ success: true, count, remaining, max: MAX_SLOT });
  } catch (error) {
    console.error('Section count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Find a 1st-year student record by email (public)
// @route   GET /api/enrollment/find-first-year?email=
// @access  Public
exports.findFirstYearByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json({ success: true, found: false });

    const emailQuery = new RegExp(`^${escapeRegExp(email)}$`, 'i');
    const student = await require('../models/Student').findOne({ email: emailQuery, yearLevel: 1 });
    if (!student) return res.json({ success: true, found: false });

    return res.json({ success: true, found: true, section: String(student.section || '').toUpperCase(), student: student });
  } catch (error) {
    console.error('findFirstYearByEmail error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
