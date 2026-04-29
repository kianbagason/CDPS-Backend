const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');

// @desc    Add violation to student
// @route   POST /api/violations/:studentId
// @access  Private (Faculty, Admin)
exports.addViolation = async (req, res) => {
  try {
    const { violationType, description, status, sanction, message } = req.body;
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
      message,
      reportedBy: faculty ? faculty._id : undefined,
      status: status || 'pending',
      sanction
    };

    student.violations.push(violation);
    await student.save();

    // Create notification for the student (if userId present)
    try {
      if (student.userId) {
        const reportedByName = faculty ? `${faculty.firstName || ''} ${faculty.lastName || ''}`.trim() : 'A staff member';
        const noteMsg = message && message.trim() !== '' ? message : `A violation has been recorded for you.`;
        const studentReport = `Violation recorded\n- Student: ${student.firstName} ${student.lastName} (${student.studentNumber})\n- Type: ${violationType}\n- Description: ${description || '—'}\n- Sanction: ${sanction || '—'}\n- Reported by: ${reportedByName}\n- Date: ${new Date().toLocaleString()}\n\nMessage: ${noteMsg}`;
        await Notification.create({ userId: student.userId, message: studentReport });
      }

      // Create a confirmation/report notification for the recorder (faculty/admin)
      try {
        const recorderId = req.user && req.user._id;
        if (recorderId) {
          const studentName = `${student.firstName} ${student.lastName}`.trim();
          const recorderReport = `You recorded a violation\n- Student: ${studentName} (${student.studentNumber})\n- Type: ${violationType}\n- Description: ${description || '—'}\n- Sanction: ${sanction || '—'}\n- Status: ${violation.status}\n- Date: ${new Date().toLocaleString()}\n\nSaved to student record.`;
          await Notification.create({ userId: recorderId, message: recorderReport });
        }
      } catch (recNotifErr) {
        console.error('Failed to create recorder notification:', recNotifErr);
      }
    } catch (notifErr) {
      console.error('Failed to create violation notification:', notifErr);
    }

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

// @desc    Get all violations across students
// @route   GET /api/violations
// @access  Private (Faculty, Admin)
exports.getAllViolations = async (req, res) => {
  try {
    // Find students that have at least one violation
    const students = await Student.find({ 'violations.0': { $exists: true } })
      .select('studentNumber firstName lastName violations')
      .populate('violations.reportedBy', 'firstName lastName');

    // Flatten violations with student info
    const all = [];
    students.forEach(student => {
      const studentName = `${student.lastName}, ${student.firstName}`;
      student.violations.forEach(v => {
        all.push({
          studentId: student._id,
          studentNumber: student.studentNumber,
          studentName,
          violation: v
        });
      });
    });

    // Sort by violation date descending (recent first)
    all.sort((a, b) => new Date(b.violation.date || b.violation.createdAt || Date.now()) - new Date(a.violation.date || a.violation.createdAt || Date.now()));

    res.json({ success: true, data: all });
  } catch (error) {
    console.error('Get all violations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
