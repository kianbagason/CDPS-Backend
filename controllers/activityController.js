const Activity = require('../models/Activity');
const Class = require('../models/Class');
const Faculty = require('../models/Faculty');

// @desc    Create activity
// @route   POST /api/classes/:classId/activities
// @access  Private (Faculty)
exports.createActivity = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, type, attachments, maxScore, dueDate, status } = req.body;

    // Verify class exists and faculty owns it
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (classItem.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create activities for this class'
      });
    }

    const activity = new Activity({
      class: classId,
      title,
      description,
      type,
      attachments,
      maxScore,
      dueDate,
      status,
      createdBy: faculty._id
    });

    await activity.save();

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get activities for a class
// @route   GET /api/classes/:classId/activities
// @access  Private
exports.getClassActivities = async (req, res) => {
  try {
    const { classId } = req.params;

    const activities = await Activity.find({ class: classId })
      .populate('createdBy', 'firstName lastName')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Private
exports.getActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('class', 'className course yearLevel section');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private (Faculty)
exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Verify faculty owns this activity
    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (activity.createdBy.toString() !== faculty._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this activity'
      });
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedActivity
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
// @route   DELETE /api/activities/:id
// @access  Private (Faculty)
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Verify faculty owns this activity
    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (activity.createdBy.toString() !== faculty._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this activity'
      });
    }

    await activity.deleteOne();

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
