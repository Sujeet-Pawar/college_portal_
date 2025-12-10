const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a course code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a course name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    credits: {
      type: Number,
      required: [true, 'Please add number of credits'],
      min: [1, 'Credits must be at least 1'],
    },
    department: {
      type: String,
      required: [true, 'Please add a department'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a teacher'],
    },
    schedule: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        room: {
          type: String,
          required: true,
        },
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
      },
    ],
    resources: [
      {
        title: String,
        description: String,
        fileUrl: String,
        fileType: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create a compound index for schedule to prevent double booking
courseSchema.index(
  { 'schedule.day': 1, 'schedule.startTime': 1, 'schedule.room': 1 },
  { unique: true, partialFilterExpression: { 'schedule.day': { $exists: true } } }
);

module.exports = mongoose.model('Course', courseSchema);
