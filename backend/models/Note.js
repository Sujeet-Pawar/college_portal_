const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject'],
    },
    description: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileType: {
      type: String,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    courseName: {
      type: String,
      trim: true,
    },
    pages: {
      type: Number,
      default: 0,
    },
    tag: {
      type: String,
      enum: ['Important', 'Exam', 'Reference', 'Assignment'],
      default: 'Reference',
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Note', noteSchema);

