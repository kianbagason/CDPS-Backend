const Student = require('../models/Student');

// @desc    Add activity to student
// @route   POST /api/activities/:studentId
// @access  Private (Admin, Student)
exports.addActivity = async (req, res) => {
  try {
    const { activityName, type, role, date, description, certificate } = req.body;
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const activity = {
      activityName,
      type,
      role,
      date,
      description,
      certificate
    };

    student.nonAcademicActivities.push(activity);
    await student.save();

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:studentId/:activityId
// @access  Private (Admin)
exports.updateActivity = async (req, res) => {
  try {
    const { studentId, activityId } = req.params;
    const updates = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const activity = student.nonAcademicActivities.id(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    Object.keys(updates).forEach(key => {
      activity[key] = updates[key];
    });

    await student.save();

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:studentId/:activityId
// @access  Private (Admin)
exports.deleteActivity = async (req, res) => {
  try {
    const { studentId, activityId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.nonAcademicActivities = student.nonAcademicActivities.filter(a => a._id.toString() !== activityId);
    await student.save();

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
