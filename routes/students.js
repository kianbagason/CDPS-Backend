const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudent,
  getMyProfile,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// Student portal route
router.get('/profile/me', protect, authorize('student'), getMyProfile);

// Allow students to update their own profile
router.put('/profile/me', protect, authorize('student'), require('../controllers/studentController').updateMyProfile);

// Admin/Faculty routes
router.get('/stats', protect, authorize('admin', 'faculty'), getStats);
router.get('/count', protect, authorize('admin','faculty'), require('../controllers/studentController').countStudents);
router.get('/', getAllStudents);
router.get('/:id', protect, getStudent);
router.post('/', protect, authorize('admin'), createStudent);
router.put('/:id', protect, authorize('admin'), updateStudent);
router.delete('/:id', protect, authorize('admin'), deleteStudent);

module.exports = router;
