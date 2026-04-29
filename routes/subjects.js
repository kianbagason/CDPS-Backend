const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Public read access for all authenticated users
router.route('/')
  .get(getSubjects);

router.route('/:id')
  .get(getSubject);

// Admin only routes for CRUD operations
router.route('/')
  .post(authorize('admin'), createSubject);

router.route('/:id')
  .put(authorize('admin'), updateSubject)
  .delete(authorize('admin'), deleteSubject);

module.exports = router;
