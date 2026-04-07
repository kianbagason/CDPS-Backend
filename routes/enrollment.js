const express = require('express');
const router = express.Router();
const { enrollStudent, checkStudentNumber } = require('../controllers/enrollmentController');

router.post('/register', enrollStudent);
router.get('/check/:studentNumber', checkStudentNumber);

module.exports = router;
