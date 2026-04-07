const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// @desc    Add violation to student
// @route   POST /api/violations/:studentId
// @access  Private (Faculty, Admin)
exports.addViolation = async (req, res) => {
  try {
    const { violationType, description, status, sanction } = req.body;
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Find faculty profile
    const faculty = await Faculty.findOne({ userId: req.user._id });

    const violation = {
      violationType,
      description,
      reportedBy: faculty ? faculty._id : undefined,
      status: status || 'pending',
      sanction
    };

    student.violations.push(violation);
    await student.save();

    res.status(201).json({
      success: true,
      data: violation
    });
  } catch (error) {
    console.error('Add violation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update violation
// @route   PUT /api/violations/:studentId/:violationId
// @access  Private (Faculty, Admin)
exports.updateViolation = async (req, res) => {
  try {
    const { studentId, violationId } = req.params;
    const updates = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const violation = student.violations.id(violationId);
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      violation[key] = updates[key];
    });

    await student.save();

    res.json({
      success: true,
      data: violation
    });
  } catch (error) {
    console.error('Update violation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete violation
// @route   DELETE /api/violations/:studentId/:violationId
// @access  Private (Admin)
exports.deleteViolation = async (req, res) => {
  try {
    const { studentId, violationId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.violations = student.violations.filter(v => v._id.toString() !== violationId);
    await student.save();

    res.json({
      success: true,
      message: 'Violation deleted successfully'
    });
  } catch (error) {
    console.error('Delete violation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
