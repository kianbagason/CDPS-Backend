const express = require('express');
const router = express.Router();
const {
  addViolation,
  updateViolation,
  deleteViolation
} = require('../controllers/violationController');
const { getAllViolations } = require('../controllers/violationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:studentId', protect, authorize('faculty', 'admin'), addViolation);
router.get('/', protect, authorize('faculty', 'admin'), getAllViolations);
router.put('/:studentId/:violationId', protect, authorize('faculty', 'admin'), updateViolation);
router.delete('/:studentId/:violationId', protect, authorize('admin'), deleteViolation);

module.exports = router;
