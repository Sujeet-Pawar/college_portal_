const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  addResource,
} = require('../controllers/courseController');

// All routes are protected
router.use(protect);

router.route('/').get(getCourses).post(authorize('teacher', 'admin'), createCourse);

router.route('/:id').get(getCourse).put(authorize('teacher', 'admin'), updateCourse).delete(authorize('teacher', 'admin'), deleteCourse);

router.route('/:id/enroll').put(enrollInCourse);
router.route('/:id/resources').post(authorize('teacher', 'admin'), addResource);

module.exports = router;
