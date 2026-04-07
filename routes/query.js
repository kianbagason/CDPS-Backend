const express = require('express');
const router = express.Router();
const {
  queryStudents,
  getAvailableSkills,
  getAvailableAffiliations,
  exportStudents
} = require('../controllers/queryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/students', protect, queryStudents);
router.get('/students/export', protect, authorize('admin', 'faculty'), exportStudents);
router.get('/skills', protect, getAvailableSkills);
router.get('/affiliations', protect, getAvailableAffiliations);

module.exports = router;
