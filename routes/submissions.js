const express = require('express');
const router = express.Router();
const {
  submitActivity,
  getActivitySubmissions,
  getMySubmission,
  gradeSubmission,
  returnSubmission,
  deleteSubmission
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Student routes
router.post('/activities/:activityId/submit', authorize('student'), submitActivity);
router.get('/activities/:activityId/submission/me', authorize('student'), getMySubmission);
router.delete('/:id', authorize('student'), deleteSubmission);

// Faculty routes
router.get('/activities/:activityId/submissions', authorize('faculty'), getActivitySubmissions);
router.put('/:id/grade', authorize('faculty'), gradeSubmission);
router.put('/:id/return', authorize('faculty'), returnSubmission);

module.exports = router;
