const express = require('express');
const router = express.Router();
const { enrollStudent, checkStudentNumber } = require('../controllers/enrollmentController');

router.post('/register', enrollStudent);
router.get('/check/:studentNumber', checkStudentNumber);
router.get('/section-count', require('../controllers/enrollmentController').getSectionCount);
router.get('/find-first-year', require('../controllers/enrollmentController').findFirstYearByEmail);

module.exports = router;
