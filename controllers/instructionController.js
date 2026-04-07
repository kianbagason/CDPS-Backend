const Instruction = require('../models/Instruction');

// @desc    Get all instructions
// @route   GET /api/instruction
// @access  Private
exports.getAllInstructions = async (req, res) => {
  try {
    const { type, course, semester, year } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);

    const instructions = await Instruction.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: instructions
    });
  } catch (error) {
    console.error('Get instructions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single instruction
// @route   GET /api/instruction/:id
// @access  Private
exports.getInstruction = async (req, res) => {
  try {
    const instruction = await Instruction.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!instruction) {
      return res.status(404).json({
        success: false,
        message: 'Instruction not found'
      });
    }

    res.json({
      success: true,
      data: instruction
    });
  } catch (error) {
    console.error('Get instruction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create instruction
// @route   POST /api/instruction
// @access  Private (Faculty, Admin)
exports.createInstruction = async (req, res) => {
  try {
    const Faculty = require('../models/Faculty');
    const faculty = await Faculty.findOne({ userId: req.user._id });

    const instruction = new Instruction({
      ...req.body,
      createdBy: faculty ? faculty._id : undefined
    });

    await instruction.save();

    res.status(201).json({
      success: true,
      data: instruction
    });
  } catch (error) {
    console.error('Create instruction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update instruction
// @route   PUT /api/instruction/:id
// @access  Private (Faculty, Admin)
exports.updateInstruction = async (req, res) => {
  try {
    const instruction = await Instruction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!instruction) {
      return res.status(404).json({
        success: false,
        message: 'Instruction not found'
      });
    }

    res.json({
      success: true,
      data: instruction
    });
  } catch (error) {
    console.error('Update instruction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete instruction
// @route   DELETE /api/instruction/:id
// @access  Private (Admin)
exports.deleteInstruction = async (req, res) => {
  try {
    const instruction = await Instruction.findById(req.params.id);

    if (!instruction) {
      return res.status(404).json({
        success: false,
        message: 'Instruction not found'
      });
    }

    await instruction.deleteOne();

    res.json({
      success: true,
      message: 'Instruction deleted successfully'
    });
  } catch (error) {
    console.error('Delete instruction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
