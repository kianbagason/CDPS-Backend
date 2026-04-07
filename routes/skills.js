const express = require('express');
const router = express.Router();
const {
  addSkill,
  updateSkill,
  deleteSkill
} = require('../controllers/skillController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:studentId', protect, authorize('admin', 'faculty'), addSkill);
router.put('/:studentId/:skillId', protect, authorize('admin'), updateSkill);
router.delete('/:studentId/:skillId', protect, authorize('admin'), deleteSkill);

module.exports = router;
