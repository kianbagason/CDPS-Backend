const Organization = require('../models/Organization');
const Group = require('../models/Group');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Private
exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find()
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: organizations });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create organization
// @route   POST /api/organizations
// @access  Private (Admin)
exports.createOrganization = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    const organization = new Organization({
      name,
      description,
      type: type || 'organization',
      createdBy: (req.user && req.user._id) ? req.user._id : null
    });

    await organization.save();

    res.status(201).json({ success: true, data: organization });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create group
// @route   POST /api/groups
// @access  Private (Admin)
exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    const group = new Group({
      name,
      description,
      createdBy: (req.user && req.user._id) ? req.user._id : null
    });

    await group.save();

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (Admin)
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const organization = await Organization.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    res.json({ success: true, data: organization });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (Admin)
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, members } = req.body;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    if (name) group.name = name;
    if (description) group.description = description;
    if (members && Array.isArray(members)) {
      group.members = members;
    }

    await group.save();

    const populatedGroup = await Group.findById(id)
      .populate('createdBy', 'firstName lastName')
      .populate('members.studentId', 'firstName lastName studentNumber');

    res.json({ success: true, data: populatedGroup });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private (Admin)
exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findById(id);
    if (!organization) return res.status(404).json({ success: false, message: 'Organization not found' });

    await Organization.findByIdAndDelete(id);
    res.json({ success: true, message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private (Admin)
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    await Group.findByIdAndDelete(id);
    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add member to organization (admin action)
// @route   POST /api/organizations/:organizationId/members
// @access  Private (Admin)
exports.addOrganizationMember = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { studentId } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) return res.status(404).json({ success: false, message: 'Organization not found' });

    const existingMember = organization.members.find(m => String(m.studentId) === String(studentId));
    if (existingMember) return res.status(400).json({ success: false, message: 'Student is already a member of this organization' });

    organization.members.push({ studentId, status: 'active', joinedAt: new Date() });
    await organization.save();

    res.json({ success: true, message: 'Member added successfully' });
  } catch (error) {
    console.error('Add organization member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add member to group (admin action)
// @route   POST /api/groups/:groupId/members
// @access  Private (Admin)
exports.addGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { studentId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const existingMember = group.members.find(m => String(m.studentId) === String(studentId));
    if (existingMember) return res.status(400).json({ success: false, message: 'Student is already a member of this group' });

    group.members.push({ studentId, status: 'active', joinedAt: new Date() });
    await group.save();

    res.json({ success: true, message: 'Member added successfully' });
  } catch (error) {
    console.error('Add group member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve member (organization)
// @route   PUT /api/organizations/:organizationId/members/:memberId/approve
// @access  Private (Admin)
exports.approveOrganizationMember = async (req, res) => {
  try {
    const { organizationId, memberId } = req.params;
    const organization = await Organization.findById(organizationId);
    if (!organization) return res.status(404).json({ success: false, message: 'Organization not found' });

    const member = organization.members.id(memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    member.status = 'active';
    await organization.save();

    res.json({ success: true, message: 'Member approved successfully' });
  } catch (error) {
    console.error('Approve organization member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve group member
// @route   PUT /api/groups/:groupId/members/:memberId/approve
// @access  Private (Admin)
exports.approveGroupMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const member = group.members.id(memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    member.status = 'active';
    await group.save();

    res.json({ success: true, message: 'Member approved successfully' });
  } catch (error) {
    console.error('Approve group member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Student join organization (request)
// @route   POST /api/organizations/:organizationId/join
// @access  Private (Student)
exports.joinOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const studentId = (req.user && req.user._id) ? req.user._id : req.body.studentId;

    if (!studentId) return res.status(400).json({ success: false, message: 'Student id required' });

    const organization = await Organization.findById(organizationId);
    if (!organization) return res.status(404).json({ success: false, message: 'Organization not found' });

    const existing = organization.members.find(m => String(m.studentId) === String(studentId));
    if (existing) return res.status(400).json({ success: false, message: 'Already a member or request pending' });

    organization.members.push({ studentId, status: 'pending', joinedAt: new Date() });
    await organization.save();

    res.json({ success: true, message: 'Join request submitted' });
  } catch (error) {
    console.error('Join organization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Student join group (request)
// @route   POST /api/groups/:groupId/join
// @access  Private (Student)
exports.joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const studentId = (req.user && req.user._id) ? req.user._id : req.body.studentId;

    if (!studentId) return res.status(400).json({ success: false, message: 'Student id required' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const existing = group.members.find(m => String(m.studentId) === String(studentId));
    if (existing) return res.status(400).json({ success: false, message: 'Already a member or request pending' });

    group.members.push({ studentId, status: 'pending', joinedAt: new Date() });
    await group.save();

    res.json({ success: true, message: 'Join request submitted' });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
