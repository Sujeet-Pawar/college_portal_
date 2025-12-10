const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please add a course'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a teacher'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Please add a due date'],
    },
    points: {
      type: Number,
      required: [true, 'Please add points'],
      default: 100,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: String,
      },
    ],
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        file: String, // Path to uploaded file
        files: [
          {
            fileName: String,
            fileUrl: String,
            fileType: String,
            fileSize: String,
          },
        ],
        grade: {
          type: Number,
          min: 0,
          max: 100,
        },
        feedback: String,
        gradedAt: Date,
        gradedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster querying
assignmentSchema.index({ course: 1, dueDate: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
