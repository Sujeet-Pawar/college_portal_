const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema(
  {
    examTitle: {
      type: String,
      required: [true, 'Please add an exam title'],
      trim: true,
    },
    examDate: {
      type: Date,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please reference a course'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please reference a student'],
    },
    marksObtained: {
      type: Number,
      required: [true, 'Please provide the marks obtained'],
      min: [0, 'Marks cannot be negative'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Please provide the total marks'],
      min: [1, 'Total marks must be at least 1'],
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pass', 'fail', 'incomplete'],
      default: 'pass',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please reference the uploader'],
    },
    metadata: {
      term: String,
      examType: String,
      remarks: String,
    },
  },
  {
    timestamps: true,
  }
);

examResultSchema.index(
  { examTitle: 1, course: 1, student: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

examResultSchema.pre('save', function (next) {
  if (this.totalMarks > 0 && (this.percentage === undefined || this.percentage === null)) {
    this.percentage = Number(((this.marksObtained / this.totalMarks) * 100).toFixed(2));
  }
  next();
});

module.exports = mongoose.model('ExamResult', examResultSchema);
