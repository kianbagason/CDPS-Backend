const Schedule = require('../models/Schedule');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
exports.getAllSchedules = async (req, res) => {
  try {
    const { course, section, faculty, semester, year, day } = req.query;
    
    const query = {};
    if (course) query.course = course;
    if (section) query.section = new RegExp(`^${escapeRegExp(section)}$`, 'i');
    if (faculty) query.faculty = faculty;
    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);
    if (day) query.day = day;

    const schedules = await Schedule.find(query)
      .populate('faculty', 'firstName lastName')
      .sort({ day: 1, startTime: 1 });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single schedule
// @route   GET /api/schedules/:id
// @access  Private
exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('faculty', 'firstName lastName');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create schedule with conflict detection
// @route   POST /api/schedules
// @access  Private (Admin)
exports.createSchedule = async (req, res) => {
  try {
    const { faculty, room, day, startTime, endTime, semester, year } = req.body;

    // Check for time conflicts
    const conflict = await Schedule.findOne({
      faculty,
      day,
      semester,
      year,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Schedule conflict detected for this faculty member'
      });
    }

    // Check room conflict
    const roomConflict = await Schedule.findOne({
      room,
      day,
      semester,
      year,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (roomConflict) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for this time slot'
      });
    }

    const schedule = new Schedule(req.body);
    await schedule.save();

    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private (Admin)
exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private (Admin)
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    await schedule.deleteOne();

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get faculty's own schedule
// @route   GET /api/schedules/faculty
// @access  Private (Faculty)
exports.getFacultySchedule = async (req, res) => {
  try {
    // Get faculty profile for logged-in user
    const faculty = await Faculty.findOne({ userId: req.user.id });
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    const schedules = await Schedule.find({ faculty: faculty._id })
      .populate('faculty', 'firstName lastName facultyId')
      .sort({ day: 1, startTime: 1 });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Get faculty schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get students enrolled in a schedule's course/section
// @route   GET /api/schedules/:id/students
// @access  Private
exports.getEnrolledStudents = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Find students matching the course and section
    const students = await Student.find({
      course: schedule.course,
      section: new RegExp(`^${escapeRegExp(schedule.section || '')}$`, 'i')
    }).select('studentNumber firstName lastName email course yearLevel');

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Get enrolled students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
