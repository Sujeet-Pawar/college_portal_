const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
} = require('../controllers/timetableController');

router.use(protect);

router
  .route('/')
  .get(getTimetable)
  .post(authorize('teacher', 'admin'), createTimetableEntry);

router
  .route('/:id')
  .put(authorize('teacher', 'admin'), updateTimetableEntry)
  .delete(authorize('teacher', 'admin'), deleteTimetableEntry);

module.exports = router;

