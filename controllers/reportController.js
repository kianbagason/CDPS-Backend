const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Schedule = require('../models/Schedule');
const Event = require('../models/Event');

// @desc    Generate comprehensive reports
// @route   GET /api/reports/:type
// @access  Private (Admin only)
exports.generateReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { course, yearLevel, semester, startDate, endDate, format } = req.query;

    let report = {};

    switch (type) {
      case 'student-enrollment':
        report = await generateStudentEnrollmentReport(course, yearLevel);
        break;
      case 'student-demographics':
        report = await generateStudentDemographicsReport(course);
        break;
      case 'academic-performance':
        report = await generateAcademicPerformanceReport(course, yearLevel);
        break;
      case 'violations-summary':
        report = await generateViolationsSummaryReport(course, startDate, endDate);
        break;
      case 'skills-analysis':
        report = await generateSkillsAnalysisReport(course);
        break;
      case 'faculty-workload':
        report = await generateFacultyWorkloadReport(semester);
        break;
      case 'events-participation':
        report = await generateEventsParticipationReport(startDate, endDate);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Student Enrollment Report
async function generateStudentEnrollmentReport(course, yearLevel) {
  const query = {};
  if (course) query.course = course;
  if (yearLevel) query.yearLevel = parseInt(yearLevel);

  const students = await Student.find(query);
  
  const byCourse = await Student.aggregate([
    { $match: query },
    { $group: { _id: '$course', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const byYearLevel = await Student.aggregate([
    { $match: query },
    { $group: { _id: '$yearLevel', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const bySection = await Student.aggregate([
    { $match: query },
    { $group: { _id: { course: '$course', yearLevel: '$yearLevel', section: '$section' }, count: { $sum: 1 } } },
    { $sort: { '_id.course': 1, '_id.yearLevel': 1, '_id.section': 1 } }
  ]);

  const byStatus = await Student.aggregate([
    { $match: query },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  return {
    title: 'Student Enrollment Report',
    generatedAt: new Date(),
    summary: {
      totalStudents: students.length,
      byCourse,
      byYearLevel,
      bySection: bySection.map(s => ({
        course: s._id.course,
        yearLevel: s._id.yearLevel,
        section: s._id.section,
        count: s.count
      })),
      byStatus
    },
    details: students.map(s => ({
      studentNumber: s.studentNumber,
      name: `${s.firstName} ${s.lastName}`,
      course: s.course,
      yearLevel: s.yearLevel,
      section: s.section,
      status: s.status,
      email: s.email,
      enrollmentYear: s.enrollmentYear
    }))
  };
}

// Student Demographics Report
async function generateStudentDemographicsReport(course) {
  const query = course ? { course } : {};

  const byGender = await Student.aggregate([
    { $match: query },
    { $group: { _id: '$gender', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const byAge = await Student.aggregate([
    { $match: query },
    {
      $project: {
        age: {
          $floor: {
            $divide: [{ $subtract: [new Date(), '$dateOfBirth'] }, 365.25 * 24 * 60 * 60 * 1000]
          }
        }
      }
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lte: ['$_id', 18] }, then: '18 and below' },
              { case: { $lte: ['$_id', 20] }, then: '19-20' },
              { case: { $lte: ['$_id', 22] }, then: '21-22' },
              { case: { $lte: ['$_id', 24] }, then: '23-24' }
            ],
            default: '25 and above'
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    title: 'Student Demographics Report',
    generatedAt: new Date(),
    summary: {
      byGender,
      byAgeRange: byAge
    }
  };
}

// Academic Performance Report
async function generateAcademicPerformanceReport(course, yearLevel) {
  const query = {};
  if (course) query.course = course;
  if (yearLevel) query.yearLevel = parseInt(yearLevel);

  const students = await Student.find(query);

  const withHonors = students.filter(s => s.academicHistory && s.academicHistory.length > 0);
  
  return {
    title: 'Academic Performance Report',
    generatedAt: new Date(),
    summary: {
      totalStudents: students.length,
      studentsWithRecords: withHonors.length
    }
  };
}

// Violations Summary Report
async function generateViolationsSummaryReport(course, startDate, endDate) {
  const query = {};
  if (course) query.course = course;

  const students = await Student.find(query).select('violations firstName lastName studentNumber course');
  
  const allViolations = [];
  students.forEach(student => {
    if (student.violations && student.violations.length > 0) {
      student.violations.forEach(v => {
        allViolations.push({
          studentNumber: student.studentNumber,
          studentName: `${student.firstName} ${student.lastName}`,
          course: student.course,
          violationType: v.violationType,
          description: v.description,
          date: v.date,
          status: v.status,
          sanction: v.sanction
        });
      });
    }
  });

  const byType = {};
  allViolations.forEach(v => {
    byType[v.violationType] = (byType[v.violationType] || 0) + 1;
  });

  const byStatus = {};
  allViolations.forEach(v => {
    byStatus[v.status] = (byStatus[v.status] || 0) + 1;
  });

  return {
    title: 'Violations Summary Report',
    generatedAt: new Date(),
    summary: {
      totalViolations: allViolations.length,
      byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
      byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count }))
    },
    details: allViolations
  };
}

// Skills Analysis Report
async function generateSkillsAnalysisReport(course) {
  const query = course ? { course } : {};

  const skills = await Student.aggregate([
    { $match: query },
    { $unwind: '$skills' },
    {
      $group: {
        _id: '$skills.skillName',
        count: { $sum: 1 },
        byProficiency: {
          $push: '$skills.proficiencyLevel'
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const skillsWithProficiency = skills.map(s => {
    const proficiencyCount = {};
    s.byProficiency.forEach(p => {
      proficiencyCount[p] = (proficiencyCount[p] || 0) + 1;
    });
    
    return {
      skill: s._id,
      totalStudents: s.count,
      proficiency: proficiencyCount
    };
  });

  return {
    title: 'Skills Analysis Report',
    generatedAt: new Date(),
    summary: {
      totalSkills: skills.length,
      topSkills: skillsWithProficiency.slice(0, 10)
    },
    details: skillsWithProficiency
  };
}

// Faculty Workload Report
async function generateFacultyWorkloadReport(semester) {
  const query = {};
  if (semester) query.semester = semester;

  const schedules = await Schedule.find(query).populate('faculty');
  
  const facultyWorkload = {};
  schedules.forEach(schedule => {
    const facultyId = schedule.faculty._id.toString();
    if (!facultyWorkload[facultyId]) {
      facultyWorkload[facultyId] = {
        facultyName: `${schedule.faculty.firstName} ${schedule.faculty.lastName}`,
        facultyId: schedule.faculty.facultyId,
        department: schedule.faculty.department,
        subjects: [],
        totalHours: 0
      };
    }
    
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    const hours = endHour - startHour;
    
    facultyWorkload[facultyId].subjects.push({
      subjectCode: schedule.subjectCode,
      subjectName: schedule.subjectName,
      course: schedule.course,
      section: schedule.section,
      day: schedule.day,
      time: `${schedule.startTime} - ${schedule.endTime}`,
      hours
    });
    
    facultyWorkload[facultyId].totalHours += hours;
  });

  return {
    title: 'Faculty Workload Report',
    generatedAt: new Date(),
    semester: semester || 'All',
    summary: {
      totalFaculty: Object.keys(facultyWorkload).length,
      totalSchedules: schedules.length
    },
    details: Object.values(facultyWorkload).sort((a, b) => b.totalHours - a.totalHours)
  };
}

// Events Participation Report
async function generateEventsParticipationReport(startDate, endDate) {
  const query = {};
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const events = await Event.find(query);
  
  const totalParticipants = events.reduce((sum, event) => {
    return sum + (event.participants ? event.participants.length : 0);
  }, 0);

  return {
    title: 'Events Participation Report',
    generatedAt: new Date(),
    summary: {
      totalEvents: events.length,
      totalParticipants
    },
    details: events.map(event => ({
      eventName: event.title,
      date: event.date,
      type: event.type,
      participants: event.participants ? event.participants.length : 0
    }))
  };
}
