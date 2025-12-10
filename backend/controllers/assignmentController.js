const path = require('path');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all assignments
// @route   GET /api/v1/assignments
// @access  Private
exports.getAssignments = async (req, res, next) => {
  try {
    const { courseId, status } = req.query;
    let query = {};

    if (courseId) {
      query.course = courseId;
    }

    if (req.user?.role === 'teacher') {
      query.teacher = req.user.id;
    }

    if (status === 'upcoming') {
      query.dueDate = { $gte: new Date() };
    } else if (status === 'past') {
      query.dueDate = { $lt: new Date() };
    }

    const assignments = await Assignment.find(query)
      .populate('course', 'name code')
      .populate('teacher', 'name email')
      .populate('submissions.student', 'name email')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single assignment
// @route   GET /api/v1/assignments/:id
// @access  Private
exports.getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'name code')
      .populate('teacher', 'name email')
      .populate('submissions.student', 'name email');

    if (!assignment) {
      return next(
        new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
      );
    }

    if (
      req.user?.role === 'teacher' &&
      assignment.teacher?.toString() !== req.user.id
    ) {
      return next(
        new ErrorResponse('Not authorized to access this assignment', 403)
      );
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new assignment
// @route   POST /api/v1/assignments
// @access  Private (Teacher/Admin)
exports.createAssignment = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ErrorResponse('User context missing', 401));
    }

    req.body.teacher = req.user.id;

    const assignment = await Assignment.create(req.body);

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update assignment
// @route   PUT /api/v1/assignments/:id
// @access  Private (Teacher/Admin)
exports.updateAssignment = async (req, res, next) => {
  try {
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return next(
        new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is assignment owner or admin
    if (assignment.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this assignment`,
          403
        )
      );
    }

    assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/v1/assignments/:id
// @access  Private (Teacher/Admin)
exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return next(
        new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is assignment owner or admin
    if (assignment.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this assignment`,
          403
        )
      );
    }

    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit assignment
// @route   POST /api/v1/assignments/:id/submit
// @access  Private (Student)
exports.submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return next(
        new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      (sub) => sub.student.toString() === req.user.id
    );

    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const relativePath = path.posix.join('uploads', req.file.filename);
    const fileMetadata = {
      fileName: req.file.originalname,
      fileUrl: relativePath,
      fileType: req.file.mimetype,
      fileSize: String(req.file.size || ''),
    };

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.file = relativePath;
      existingSubmission.files = [fileMetadata];
      existingSubmission.submittedAt = new Date();
    } else {
      // Create new submission
      assignment.submissions.push({
        student: req.user.id,
        file: relativePath,
        files: [fileMetadata],
        submittedAt: new Date(),
      });
    }

    await assignment.save();

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Grade assignment
// @route   PUT /api/v1/assignments/:id/grade
// @access  Private (Teacher/Admin)
exports.gradeAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return next(
        new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
      );
    }

    const submission = assignment.submissions.id(req.body.submissionId);

    if (!submission) {
      return next(new ErrorResponse('Submission not found', 404));
    }

    submission.grade = req.body.grade;
    submission.feedback = req.body.feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;

    await assignment.save();

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};

