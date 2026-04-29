const express = require('express');
const router = express.Router();
const {
  addAffiliation,
  updateAffiliation,
  deleteAffiliation,
  getStudentAffiliations
} = require('../controllers/affiliationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:studentId', protect, authorize('admin', 'student'), addAffiliation);
router.get('/student/:studentId', protect, authorize('admin', 'student'), getStudentAffiliations);
router.put('/:studentId/:affiliationId', protect, authorize('admin'), updateAffiliation);
router.delete('/:studentId/:affiliationId', protect, authorize('admin', 'student'), deleteAffiliation);

module.exports = router;
