const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getFacultySchedule,
  getEnrolledStudents
} = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllSchedules);
router.get('/faculty', protect, authorize('faculty', 'admin'), getFacultySchedule);
router.get('/:id', protect, getSchedule);
router.get('/:id/students', protect, getEnrolledStudents);
router.post('/', protect, authorize('admin'), createSchedule);
router.put('/:id', protect, authorize('admin'), updateSchedule);
router.delete('/:id', protect, authorize('admin'), deleteSchedule);

module.exports = router;
