const Student = require('../models/Student');

function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @desc    Advanced student query/filter system
// @route   GET /api/query/students
// @access  Private
exports.queryStudents = async (req, res) => {
  try {
    const {
      skills,
      affiliations,
      course,
      yearLevel,
      section,
      activities,
      violationType,
      status,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // Filter by course
    if (course) {
      query.course = course;
    }

    // Filter by year level
    if (yearLevel) {
      query.yearLevel = parseInt(yearLevel);
    }

    // Filter by section (case-insensitive exact match)
    if (section) {
      query.section = new RegExp(`^${escapeRegExp(section)}$`, 'i');
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by skills (can be multiple, comma-separated)
    if (skills) {
      const skillArray = skills.split(',');
      query.skills = {
        $elemMatch: {
          skillName: { $in: skillArray.map(s => new RegExp(s, 'i')) }
        }
      };
    }

    // Filter by affiliations (can be multiple, comma-separated)
    if (affiliations) {
      const affiliationArray = affiliations.split(',');
      query.affiliations = {
        $elemMatch: {
          organizationName: { $in: affiliationArray.map(a => new RegExp(a, 'i')) }
        }
      };
    }

    // Filter by activities
    if (activities) {
      const activityArray = activities.split(',');
      query.nonAcademicActivities = {
        $elemMatch: {
          activityName: { $in: activityArray.map(a => new RegExp(a, 'i')) }
        }
      };
    }

    // Filter by violation type
    if (violationType) {
      query.violations = {
        $elemMatch: {
          violationType: new RegExp(violationType, 'i')
        }
      };
    }

    // Execute query with pagination
    const students = await Student.find(query)
      .populate('userId', 'username role')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ lastName: 1, firstName: 1 });

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      count: students.length,
      data: students,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      },
      filters: {
        skills: skills ? skills.split(',') : [],
        affiliations: affiliations ? affiliations.split(',') : [],
        course,
        yearLevel,
        section,
        activities: activities ? activities.split(',') : [],
        violationType,
        status
      }
    });
  } catch (error) {
    console.error('Query students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get available skills for filtering
// @route   GET /api/query/skills
// @access  Private
exports.getAvailableSkills = async (req, res) => {
  try {
    const skills = await Student.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills.skillName', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: skills.map(s => ({ name: s._id, count: s.count }))
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get available affiliations for filtering
// @route   GET /api/query/affiliations
// @access  Private
exports.getAvailableAffiliations = async (req, res) => {
  try {
    const affiliations = await Student.aggregate([
      { $unwind: '$affiliations' },
      { $group: { _id: '$affiliations.organizationName', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: affiliations.map(a => ({ name: a._id, count: a.count }))
    });
  } catch (error) {
    console.error('Get affiliations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export students to CSV format
// @route   GET /api/query/students/export
// @access  Private (Admin, Faculty)
exports.exportStudents = async (req, res) => {
  try {
    const { skills, course, yearLevel } = req.query;
    
    const query = {};
    if (course) query.course = course;
    if (yearLevel) query.yearLevel = parseInt(yearLevel);
    if (skills) {
      const skillArray = skills.split(',');
      query.skills = {
        $elemMatch: {
          skillName: { $in: skillArray.map(s => new RegExp(s, 'i')) }
        }
      };
    }

    const students = await Student.find(query).select(
      'firstName lastName studentNumber course yearLevel section email skills affiliations'
    );

    // Convert to CSV
    const csvRows = [];
    const headers = ['First Name', 'Last Name', 'Student Number', 'Course', 'Year Level', 'Section', 'Email', 'Skills', 'Affiliations'];
    csvRows.push(headers.join(','));

    students.forEach(student => {
      const skills = student.skills.map(s => s.skillName).join('; ');
      const affiliations = student.affiliations.map(a => a.organizationName).join('; ');
      
      const row = [
        student.firstName,
        student.lastName,
        student.studentNumber,
        student.course,
        student.yearLevel,
        student.section,
        student.email,
        `"${skills}"`,
        `"${affiliations}"`
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
