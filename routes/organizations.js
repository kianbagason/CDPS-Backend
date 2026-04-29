const express = require('express');
const router = express.Router();
const {
  getAllOrganizations,
  getAllGroups,
  createOrganization,
  createGroup,
  updateOrganization,
  updateGroup,
  deleteOrganization,
  deleteGroup,
  joinOrganization,
  joinGroup,
  approveOrganizationMember,
  approveGroupMember,
  addOrganizationMember,
  addGroupMember
} = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (temporarily removed auth for testing)
router.get('/', getAllOrganizations);
router.get('/groups', getAllGroups);

// Admin routes (temporarily removed auth for testing)
router.post('/', createOrganization);
router.post('/groups', createGroup);

// Update and delete routes (temporarily removed auth for testing)
router.put('/:id', updateOrganization);
router.put('/groups/:id', updateGroup);
router.delete('/:id', deleteOrganization);
router.delete('/groups/:id', deleteGroup);

// Student routes
router.post('/:organizationId/join', protect, authorize('student'), joinOrganization);
router.post('/groups/:groupId/join', protect, authorize('student'), joinGroup);

// Admin routes - manage members (OIC concept removed)
router.put('/:organizationId/members/:memberId/approve', protect, authorize('admin'), approveOrganizationMember);
router.put('/groups/:groupId/members/:memberId/approve', protect, authorize('admin'), approveGroupMember);

// Add member routes - Admin only
router.post('/:organizationId/members', protect, authorize('admin'), addOrganizationMember);
router.post('/groups/:groupId/members', protect, authorize('admin'), addGroupMember);

module.exports = router;
