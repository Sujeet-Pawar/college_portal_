const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAttendance,
    getCourseAttendance,
    markBulkAttendance,
    exportFacultyAttendance,
    exportStudentAttendance,
} = require('../controllers/attendanceController');

router.use(protect);

// Student routes
router.route('/').get(getAttendance);
router.route('/export/student').get(exportStudentAttendance);

// Faculty routes (protected by role check in controller)
router.route('/course/:courseId').get(getCourseAttendance);
router.route('/mark-bulk').post(markBulkAttendance);
router.route('/export/faculty').get(exportFacultyAttendance);

module.exports = router;
