const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getNotes, getNote, createNote, downloadNote } = require('../controllers/notesController');

router.use(protect);

router
  .route('/')
  .get(getNotes)
  .post(upload.single('file'), createNote);

router.route('/:id').get(getNote);
router.route('/:id/download').get(downloadNote);

module.exports = router;

