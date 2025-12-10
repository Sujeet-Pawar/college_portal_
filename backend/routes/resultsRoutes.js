const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getResults,
  getTeacherResults,
  uploadExamResults,
} = require('../controllers/resultsController');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/').get(getResults);
router.route('/teacher').get(authorize('teacher', 'admin'), getTeacherResults);
router
  .route('/upload')
  .post(authorize('teacher', 'admin'), upload.single('file'), uploadExamResults);

module.exports = router;
