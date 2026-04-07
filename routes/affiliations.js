const express = require('express');
const router = express.Router();
const {
  addAffiliation,
  updateAffiliation,
  deleteAffiliation
} = require('../controllers/affiliationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:studentId', protect, authorize('admin', 'student'), addAffiliation);
router.put('/:studentId/:affiliationId', protect, authorize('admin'), updateAffiliation);
router.delete('/:studentId/:affiliationId', protect, authorize('admin'), deleteAffiliation);

module.exports = router;
