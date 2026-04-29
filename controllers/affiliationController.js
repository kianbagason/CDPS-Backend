const Student = require('../models/Student');
const Affiliation = require('../models/Affiliation');
const Organization = require('../models/Organization');
const Group = require('../models/Group');

// @desc    Add affiliation to student
// @route   POST /api/affiliations
// @access  Private (Admin, Student)
exports.addAffiliation = async (req, res) => {
  try {
    // Accept studentId from URL param, body, or default to authenticated user
    const studentId = req.params.studentId || req.body.studentId || (req.user && req.user._id);
    const { organizationId, groupId, role, startDate, endDate } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'studentId is required' });
    }

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Validate organization or group exists
    if (organizationId) {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }
    }

    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }
    }

    // Check if affiliation already exists
    const existingAffiliation = await Affiliation.findOne({
      studentId,
      $or: [{ organizationId }, { groupId }]
    });

    if (existingAffiliation) {
      return res.status(400).json({
        success: false,
        message: 'Student already affiliated with this organization/group'
      });
    }

    const affiliation = new Affiliation({
      studentId,
      organizationId: organizationId || null,
      groupId: groupId || null,
      role: role || 'member',
      startDate: startDate || new Date(),
      endDate: endDate || null
    });

    await affiliation.save();

    // Also add to organization/group members list for consistency
    if (organizationId) {
      await Organization.findByIdAndUpdate(organizationId, {
        $push: { members: { studentId, status: 'active', joinedAt: new Date() } }
      });
    }

    if (groupId) {
      await Group.findByIdAndUpdate(groupId, {
        $push: { members: { studentId, status: 'active', joinedAt: new Date() } }
      });
    }

    const populatedAffiliation = await Affiliation.findById(affiliation._id)
      .populate('studentId', 'firstName lastName studentNumber')
      .populate('organizationId', 'name description')
      .populate('groupId', 'name description');

    res.status(201).json({
      success: true,
      data: populatedAffiliation
    });
  } catch (error) {
    console.error('Add affiliation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student affiliations
// @route   GET /api/affiliations/student/:studentId
// @access  Private (Admin, Student)
exports.getStudentAffiliations = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Regular affiliations created via Affiliation model
    const affiliations = await Affiliation.find({ studentId })
      .populate('organizationId', 'name description type')
      .populate('groupId', 'name description')
      .sort({ startDate: -1 });

    res.json({
      success: true,
      data: affiliations
    });
  } catch (error) {
    console.error('Get student affiliations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all affiliations
// @route   GET /api/affiliations
// @access  Private (Admin)
exports.getAllAffiliations = async (req, res) => {
  try {
    const affiliations = await Affiliation.find()
      .populate('studentId', 'firstName lastName studentNumber')
      .populate('organizationId', 'name description type')
      .populate('groupId', 'name description')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: affiliations
    });
  } catch (error) {
    console.error('Get all affiliations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update affiliation
// @route   PUT /api/affiliations/:id
// @access  Private (Admin, Student)
exports.updateAffiliation = async (req, res) => {
  try {
    const { role, status, endDate, achievements, responsibilities, notes } = req.body;
    const affiliationId = req.params.id;

    const affiliation = await Affiliation.findById(affiliationId);
    if (!affiliation) {
      return res.status(404).json({
        success: false,
        message: 'Affiliation not found'
      });
    }

    // Update fields
    if (role) affiliation.role = role;
    if (status) affiliation.status = status;
    if (endDate !== undefined) affiliation.endDate = endDate;
    if (achievements) affiliation.achievements = achievements;
    if (responsibilities) affiliation.responsibilities = responsibilities;
    if (notes !== undefined) affiliation.notes = notes;

    await affiliation.save();

    res.json({
      success: true,
      data: affiliation
    });
  } catch (error) {
    console.error('Update affiliation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete affiliation
// @route   DELETE /api/affiliations/:studentId/:affiliationId
// @access  Private (Admin, Student - student may delete their own)
exports.deleteAffiliation = async (req, res) => {
  try {
    const { studentId, affiliationId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // allow admin or the student owner
    if (!(req.user && req.user.role === 'admin')) {
      if (!student.userId || student.userId.toString() !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this affiliation' });
      }
    }

    const affiliation = await Affiliation.findById(affiliationId);
    if (!affiliation) {
      return res.status(404).json({ success: false, message: 'Affiliation not found' });
    }

    // ensure affiliation belongs to student
    if (affiliation.studentId.toString() !== studentId) {
      return res.status(400).json({ success: false, message: 'Affiliation does not belong to specified student' });
    }

    // remove affiliation document
    await Affiliation.findByIdAndDelete(affiliationId);

    // remove from organization or group members lists
    if (affiliation.organizationId) {
      await Organization.findByIdAndUpdate(affiliation.organizationId, { $pull: { members: { studentId } } });
    }
    if (affiliation.groupId) {
      await Group.findByIdAndUpdate(affiliation.groupId, { $pull: { members: { studentId } } });
    }

    // also remove any legacy entry from Student.affiliations array
    student.affiliations = (student.affiliations || []).filter(a => a._id.toString() !== affiliationId);
    await student.save();

    res.json({ success: true, message: 'Affiliation deleted successfully' });
  } catch (error) {
    console.error('Delete affiliation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
