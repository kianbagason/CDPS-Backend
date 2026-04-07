const Faculty = require('../models/Faculty');
const User = require('../models/User');
const { generateFacultyUsername, generatePassword } = require('../utils/generateCredentials');

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private (Admin)
exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find()
      .populate('userId', 'username role createdAt')
      .sort({ lastName: 1 });

    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single faculty
// @route   GET /api/faculty/:id
// @access  Private
exports.getFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('userId', 'username role createdAt');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create faculty
// @route   POST /api/faculty
// @access  Private (Admin)
exports.createFaculty = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, department, position, subjects } = req.body;

    // Auto-generate faculty ID in format: FAC-YYYY-XXX
    const year = new Date().getFullYear();
    const count = await Faculty.countDocuments();
    const facultyId = `FAC-${year}-${String(count + 1).padStart(3, '0')}`;

    // Generate credentials
    const username = generateFacultyUsername(firstName, lastName, facultyId);
    const password = generatePassword();

    // Create user account
    const user = new User({
      username,
      password,
      role: 'faculty'
    });

    await user.save();

    // Create faculty profile
    const faculty = new Faculty({
      facultyId,
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      subjects,
      userId: user._id
    });

    await faculty.save();

    res.status(201).json({
      success: true,
      data: {
        ...faculty.toObject(),
        credentials: { username, password }
      }
    });
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update faculty
// @route   PUT /api/faculty/:id
// @access  Private (Admin)
exports.updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
// @access  Private (Admin)
exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Delete associated user account
    await User.findByIdAndDelete(faculty.userId);
    await faculty.deleteOne();

    res.json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
