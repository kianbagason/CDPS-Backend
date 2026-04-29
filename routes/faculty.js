const express = require('express');
const router = express.Router();
const {
  getAllFaculty,
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllFaculty);
router.get('/:id', protect, getFaculty);
router.post('/', protect, authorize('admin'), createFaculty);
router.put('/:id', protect, authorize('admin'), updateFaculty);
router.delete('/:id', protect, authorize('admin'), deleteFaculty);

module.exports = router;
