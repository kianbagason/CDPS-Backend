const Student = require('../models/Student');

// @desc    Add affiliation to student
// @route   POST /api/affiliations/:studentId
// @access  Private (Admin, Student)
exports.addAffiliation = async (req, res) => {
  try {
    const { organizationName, role, type, startDate, endDate } = req.body;
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const affiliation = {
      organizationName,
      role,
      type,
      startDate,
      endDate
    };

    student.affiliations.push(affiliation);
    await student.save();

    res.status(201).json({
      success: true,
      data: affiliation
    });
  } catch (error) {
    console.error('Add affiliation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update affiliation
// @route   PUT /api/affiliations/:studentId/:affiliationId
// @access  Private (Admin)
exports.updateAffiliation = async (req, res) => {
  try {
    const { studentId, affiliationId } = req.params;
    const updates = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const affiliation = student.affiliations.id(affiliationId);
    if (!affiliation) {
      return res.status(404).json({
        success: false,
        message: 'Affiliation not found'
      });
    }

    Object.keys(updates).forEach(key => {
      affiliation[key] = updates[key];
    });

    await student.save();

    res.json({
      success: true,
      data: affiliation
    });
  } catch (error) {
    console.error('Update affiliation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete affiliation
// @route   DELETE /api/affiliations/:studentId/:affiliationId
// @access  Private (Admin)
exports.deleteAffiliation = async (req, res) => {
  try {
    const { studentId, affiliationId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.affiliations = student.affiliations.filter(a => a._id.toString() !== affiliationId);
    await student.save();

    res.json({
      success: true,
      message: 'Affiliation deleted successfully'
    });
  } catch (error) {
    console.error('Delete affiliation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
