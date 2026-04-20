const express = require('express');
const router = express.Router();
const {
  createClass,
  getFacultyClasses,
  getStudentClasses,
  getClass,
  enrollStudent,
  getEnrolledStudents,
  updateClass,
  deleteClass
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Faculty routes
router.post('/', authorize('faculty'), createClass);
router.get('/faculty', authorize('faculty'), getFacultyClasses);
router.get('/:id/students', authorize('faculty'), getEnrolledStudents);
router.put('/:id', authorize('faculty'), updateClass);
router.delete('/:id', authorize('faculty'), deleteClass);

// Student routes
router.get('/student', authorize('student'), getStudentClasses);
router.post('/:id/enroll', authorize('student'), enrollStudent);

// Shared routes
router.get('/:id', getClass);

module.exports = router;
