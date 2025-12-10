const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeAssignment,
} = require('../controllers/assignmentController');

// All routes are protected
router.use(protect);

router.route('/').get(getAssignments).post(authorize('teacher', 'admin'), createAssignment);

router
  .route('/:id')
  .get(getAssignment)
  .put(authorize('teacher', 'admin'), updateAssignment)
  .delete(authorize('teacher', 'admin'), deleteAssignment);

const upload = require('../middleware/upload');

router.route('/:id/submit').post(authorize('student'), upload.single('file'), submitAssignment);
router.route('/:id/grade').put(authorize('teacher', 'admin'), gradeAssignment);

module.exports = router;

