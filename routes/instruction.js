const express = require('express');
const router = express.Router();
const {
  getAllInstructions,
  getInstruction,
  createInstruction,
  updateInstruction,
  deleteInstruction
} = require('../controllers/instructionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllInstructions);
router.get('/:id', protect, getInstruction);
router.post('/', protect, authorize('faculty', 'admin'), createInstruction);
router.put('/:id', protect, authorize('faculty', 'admin'), updateInstruction);
router.delete('/:id', protect, authorize('admin'), deleteInstruction);

module.exports = router;
