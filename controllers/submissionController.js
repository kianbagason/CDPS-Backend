const Submission = require('../models/Submission');
const Activity = require('../models/Activity');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// @desc    Submit activity
// @route   POST /api/activities/:activityId/submit
// @access  Private (Student)
exports.submitActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { content, attachments } = req.body;

    // Verify activity exists
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    if (activity.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'This activity is no longer accepting submissions'
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

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      activity: activityId,
      student: student._id
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this activity. Please contact your faculty if you need to resubmit.'
      });
    }

    // Determine if late
    const now = new Date();
    const dueDate = new Date(activity.dueDate);
    const status = now > dueDate ? 'late' : 'submitted';

    const submission = new Submission({
      activity: activityId,
      student: student._id,
      content,
      attachments,
      status
    });

    await submission.save();

    res.status(201).json({
      success: true,
      message: 'Activity submitted successfully',
      data: submission
    });
  } catch (error) {
    console.error('Submit activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get submissions for an activity
// @route   GET /api/activities/:activityId/submissions
// @access  Private (Faculty)
exports.getActivitySubmissions = async (req, res) => {
  try {
    const { activityId } = req.params;

    // Verify faculty owns the activity
    const activity = await Activity.findById(activityId).populate('class');
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (activity.createdBy.toString() !== faculty._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these submissions'
      });
    }

    const submissions = await Submission.find({ activity: activityId })
      .populate('student', 'firstName lastName studentNumber email course yearLevel')
      .populate('gradedBy', 'firstName lastName')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student's submission for an activity
// @route   GET /api/activities/:activityId/submission/me
// @access  Private (Student)
exports.getMySubmission = async (req, res) => {
  try {
    const { activityId } = req.params;

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const submission = await Submission.findOne({
      activity: activityId,
      student: student._id
    }).populate('gradedBy', 'firstName lastName');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'No submission found'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Faculty)
exports.gradeSubmission = async (req, res) => {
  try {
    const { score, feedback, status } = req.body;

    const submission = await Submission.findById(req.params.id)
      .populate('activity');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Verify faculty owns the activity
    const activity = await Activity.findById(submission.activity._id);
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (activity.createdBy.toString() !== faculty._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to grade this submission'
      });
    }

    // Validate score
    if (score !== undefined && activity.maxScore && score > activity.maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score cannot exceed maximum score of ${activity.maxScore}`
      });
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.status = status || 'graded';
    submission.gradedBy = faculty._id;
    submission.gradedAt = Date.now();

    await submission.save();

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: submission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Return submission for revision
// @route   PUT /api/submissions/:id/return
// @access  Private (Faculty)
exports.returnSubmission = async (req, res) => {
  try {
    const { feedback } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Verify faculty owns the activity
    const activity = await Activity.findById(submission.activity);
    const faculty = await Faculty.findOne({ userId: req.user._id });
    
    if (activity.createdBy.toString() !== faculty._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to return this submission'
      });
    }

    submission.status = 'returned';
    submission.feedback = feedback;
    submission.gradedBy = faculty._id;
    submission.gradedAt = Date.now();

    await submission.save();

    res.json({
      success: true,
      message: 'Submission returned for revision',
      data: submission
    });
  } catch (error) {
    console.error('Return submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private (Student or Faculty)
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Get user profile
    const student = await Student.findOne({ userId: req.user._id });
    const faculty = await Faculty.findOne({ userId: req.user._id });

    // Allow deletion if student owns it and not graded yet, or if faculty owns the activity
    const canDelete = 
      (student && submission.student.toString() === student._id.toString() && submission.status !== 'graded') ||
      (faculty && await isActivityOwner(submission.activity, faculty._id));

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this submission'
      });
    }

    await submission.deleteOne();

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to check if faculty owns the activity
async function isActivityOwner(activityId, facultyId) {
  const activity = await Activity.findById(activityId);
  return activity && activity.createdBy.toString() === facultyId.toString();
}
