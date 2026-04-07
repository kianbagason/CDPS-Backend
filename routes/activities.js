const express = require('express');
const router = express.Router();
const {
  addActivity,
  updateActivity,
  deleteActivity
} = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:studentId', protect, authorize('admin', 'student'), addActivity);
router.put('/:studentId/:activityId', protect, authorize('admin'), updateActivity);
router.delete('/:studentId/:activityId', protect, authorize('admin'), deleteActivity);

module.exports = router;
