const Student = require('../models/Student');

// @desc    Add skill to student
// @route   POST /api/skills/:studentId
// @access  Private (Admin, Faculty)
exports.addSkill = async (req, res) => {
  try {
    const { skillName, proficiencyLevel, certification, dateAcquired } = req.body;
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const skill = {
      skillName,
      proficiencyLevel: proficiencyLevel || 'Beginner',
      certification,
      dateAcquired
    };

    student.skills.push(skill);
    await student.save();

    res.status(201).json({
      success: true,
      data: skill
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:studentId/:skillId
// @access  Private (Admin)
exports.updateSkill = async (req, res) => {
  try {
    const { studentId, skillId } = req.params;
    const updates = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const skill = student.skills.id(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    Object.keys(updates).forEach(key => {
      skill[key] = updates[key];
    });

    await student.save();

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:studentId/:skillId
// @access  Private (Admin)
exports.deleteSkill = async (req, res) => {
  try {
    const { studentId, skillId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.skills = student.skills.filter(s => s._id.toString() !== skillId);
    await student.save();

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
