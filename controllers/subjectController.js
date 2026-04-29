const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
exports.getSubjects = async (req, res) => {
  try {
    const { course, yearLevel, semester, isActive } = req.query;
    
    const query = {};
    if (course) query.course = course;
    if (yearLevel) query.yearLevel = parseInt(yearLevel);
    if (semester) query.semester = semester;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const subjects = await Subject.find(query).sort({ course: 1, yearLevel: 1, semester: 1, subjectCode: 1 });

    res.json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
exports.getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private (Admin only)
exports.createSubject = async (req, res) => {
  try {
    const { subjectCode, subjectName, course, yearLevel, semester, units, description } = req.body;

    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ subjectCode: subjectCode.toUpperCase() });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists'
      });
    }

    const subject = await Subject.create({
      subjectCode: subjectCode.toUpperCase(),
      subjectName,
      course,
      yearLevel,
      semester,
      units,
      description
    });

    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin only)
exports.updateSubject = async (req, res) => {
  try {
    let subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if updating to a code that already exists
    if (req.body.subjectCode) {
      const existingSubject = await Subject.findOne({ 
        subjectCode: req.body.subjectCode.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject code already exists'
        });
      }
      
      req.body.subjectCode = req.body.subjectCode.toUpperCase();
    }

    subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin only)
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    await subject.deleteOne();

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
