const path = require('path');
const Note = require('../models/Note');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all notes
// @route   GET /api/v1/notes
// @access  Private
exports.getNotes = async (req, res, next) => {
  try {
    const { subject, courseId } = req.query;
    const query = {};

    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    if (courseId) {
      query.course = courseId;
    }

    const notes = await Note.find(query)
      .populate('author', 'name role')
      .populate('course', 'name code')
      .sort({ courseName: 1, subject: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single note
// @route   GET /api/v1/notes/:id
// @access  Private
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('author', 'name email')
      .populate('course', 'name code');

    if (!note) {
      return next(new ErrorResponse(`Note not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download note file
// @route   GET /api/v1/notes/:id/download
// @access  Private
exports.downloadNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return next(new ErrorResponse(`Note not found with id of ${req.params.id}`, 404));
    }

    if (!note.fileUrl) {
      return next(new ErrorResponse('File not available for this note', 404));
    }

    note.downloadCount += 1;
    await note.save();

    res.status(200).json({
      success: true,
      data: {
        fileUrl: note.fileUrl,
        fileName: note.fileName,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create note
// @route   POST /api/v1/notes
// @access  Private (Teacher/Admin)
exports.createNote = async (req, res, next) => {
  try {
    req.body.author = req.user.id;

    let courseDoc = null;
    if (req.body.course) {
      courseDoc = await Course.findById(req.body.course).select('name code');
      if (!courseDoc) {
        return next(new ErrorResponse('Selected course not found', 404));
      }
      req.body.courseName = courseDoc.name;
      if (!req.body.subject) {
        req.body.subject = courseDoc.name;
      }
    }

    if (req.file) {
      const relativePath = path.posix.join('uploads', req.file.filename);
      req.body.fileUrl = relativePath;
      req.body.fileName = req.file.originalname;
      req.body.fileType = req.file.mimetype;
      req.body.fileSize = req.file.size;
    } else {
      return next(new ErrorResponse('Please upload a file for the note', 400));
    }

    const note = await Note.create(req.body);

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
};

