const express = require('express');
const router = express.Router();
const {
  createActivity,
  getClassActivities,
  getActivity,
  updateActivity,
  deleteActivity
} = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Faculty only routes
router.post('/classes/:classId/activities', authorize('faculty'), createActivity);
router.put('/:id', authorize('faculty'), updateActivity);
router.delete('/:id', authorize('faculty'), deleteActivity);

// Shared routes (faculty and student)
router.get('/classes/:classId/activities', getClassActivities);
router.get('/:id', getActivity);

module.exports = router;
