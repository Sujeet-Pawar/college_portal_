const fs = require('fs').promises;
const ExcelJS = require('exceljs');
const Assignment = require('../models/Assignment');
const ExamResult = require('../models/ExamResult');
const Course = require('../models/Course');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

const REQUIRED_COLUMNS = ['student email', 'course code', 'exam title', 'marks obtained', 'total marks'];

const normalizeString = (value) => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return value.toString().trim();
  if (typeof value === 'object' && value?.text) return String(value.text).trim();
  return String(value).trim();
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value;
  if (typeof value === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const millis = value * 24 * 60 * 60 * 1000;
    const date = new Date(excelEpoch.getTime() + millis);
    if (!Number.isNaN(date.valueOf())) return date;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
};

const computePercentage = (marks, total) => {
  if (!Number.isFinite(marks) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }
  return Number(((marks / total) * 100).toFixed(2));
};

const computeGrade = (percentage) => {
  if (!Number.isFinite(percentage)) return '';
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

const summarizeRecords = (records) => {
  const valid = records.filter((record) => Number.isFinite(record.percentage));

  if (!valid.length) {
    return {
      overallAverage: 0,
      totalGraded: 0,
      highestScore: null,
      subjectWise: [],
      recentPerformance: [],
    };
  }

  const sortedByDate = [...valid].sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateB - dateA;
  });

  const totalPercent = valid.reduce((sum, record) => sum + (record.percentage || 0), 0);
  const highestRecord = valid.reduce((best, record) => {
    if (!best || (record.percentage || 0) > (best.percentage || 0)) {
      return record;
    }
    return best;
  }, null);

  const subjectMap = new Map();
  valid.forEach((record) => {
    if (!record.courseId) return;
    if (!subjectMap.has(record.courseId)) {
      subjectMap.set(record.courseId, {
        subject: record.courseName || 'Course',
        values: [],
      });
    }
    subjectMap.get(record.courseId).values.push(record.percentage || 0);
  });

  const subjectWise = Array.from(subjectMap.values()).map(({ subject, values }) => ({
    subject,
    score: values.length
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : 0,
  }));

  const recentPerformance = sortedByDate
    .slice(0, 6)
    .map((record) => ({
      label: record.date
        ? new Date(record.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })
        : record.title,
      percentage: Math.round(record.percentage || 0),
    }))
    .reverse();

  return {
    overallAverage: Math.round((totalPercent / valid.length) * 10) / 10,
    totalGraded: valid.length,
    highestScore: highestRecord
      ? {
          percentage: Math.round((highestRecord.percentage || 0) * 10) / 10,
          title: highestRecord.title,
          courseName: highestRecord.courseName,
        }
      : null,
    subjectWise,
    recentPerformance,
  };
};

const buildStudentResults = async (userId) => {
  const assignments = await Assignment.find({ 'submissions.student': userId })
    .populate('course', 'name code')
    .populate('teacher', 'name email')
    .lean();

  const examResults = await ExamResult.find({ student: userId })
    .populate('course', 'name code')
    .populate('uploadedBy', 'name email')
    .lean();

  const records = [];

  assignments.forEach((assignment) => {
    const submission = assignment.submissions.find(
      (s) => s.student?.toString() === userId.toString()
    );

    if (!submission || submission.grade === undefined || submission.grade === null) {
      return;
    }

    const pointsPossible = assignment.points || 100;
    const marksObtained = submission.grade ?? 0;
    const percentage = computePercentage(marksObtained, pointsPossible);

    records.push({
      id: `assignment-${assignment._id.toString()}`,
      type: 'assignment',
      title: assignment.title,
      courseName: assignment.course?.name || 'Course',
      courseCode: assignment.course?.code || '',
      courseId: assignment.course?._id?.toString() || null,
      personName: assignment.teacher?.name || 'Instructor',
      personEmail: assignment.teacher?.email || '',
      marksObtained,
      totalMarks: pointsPossible,
      percentage,
      date:
        submission.gradedAt ||
        submission.submittedAt ||
        assignment.updatedAt ||
        assignment.createdAt,
      metadata: {
        feedback: submission.feedback || '',
      },
    });
  });

  examResults.forEach((exam) => {
    const percentage = Number.isFinite(exam.percentage)
      ? exam.percentage
      : computePercentage(exam.marksObtained, exam.totalMarks);

    records.push({
      id: `exam-${exam._id.toString()}`,
      type: 'exam',
      title: exam.examTitle,
      courseName: exam.course?.name || 'Course',
      courseCode: exam.course?.code || '',
      courseId: exam.course?._id?.toString() || null,
      personName: exam.uploadedBy?.name || 'Exam Office',
      personEmail: exam.uploadedBy?.email || '',
      marksObtained: exam.marksObtained,
      totalMarks: exam.totalMarks,
      percentage,
      date: exam.examDate || exam.updatedAt || exam.createdAt,
      metadata: {
        term: exam.metadata?.term || '',
        examType: exam.metadata?.examType || '',
        remarks: exam.metadata?.remarks || '',
      },
    });
  });

  const summary = summarizeRecords(records);

  const tableRows = [...records]
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    })
    .map((record) => ({
      id: record.id,
      title: record.title,
      courseName: record.courseName,
      courseCode: record.courseCode,
      teacher: record.personName,
      grade: record.marksObtained,
      pointsPossible: record.totalMarks,
      percentage: Number.isFinite(record.percentage)
        ? Math.round(record.percentage * 10) / 10
        : 0,
      gradedAt: record.date,
      type: record.type,
      metadata: record.metadata,
    }));

  return {
    mode: 'student',
    overallAverage: summary.overallAverage,
    totalGraded: summary.totalGraded,
    highestScore: summary.highestScore,
    subjectWise: summary.subjectWise,
    recentPerformance: summary.recentPerformance,
    assignments: tableRows,
  };
};

const buildTeacherResults = async (user, options = {}) => {
  const courseFilter = {};

  if (user.role === 'teacher') {
    courseFilter.teacher = user._id || user.id;
  } else if (user.role === 'admin' && options.teacherId) {
    courseFilter.teacher = options.teacherId;
  }

  if (options.courseId) {
    courseFilter._id = options.courseId;
  }

  const courses = await Course.find(courseFilter)
    .select('name code teacher')
    .populate('teacher', 'name email')
    .lean();

  if (!courses.length) {
    return {
      mode: 'teacher',
      summary: {
        totalCourses: 0,
        totalRecords: 0,
        uniqueStudents: 0,
        lastImportAt: null,
      },
      courses: [],
    };
  }

  const courseIds = courses.map((course) => course._id);

  const results = await ExamResult.find({ course: { $in: courseIds } })
    .populate('student', 'name email studentId department')
    .populate('course', 'name code')
    .populate('uploadedBy', 'name email')
    .lean();

  const courseMap = new Map();
  const globalStudents = new Set();
  let totalRecords = 0;
  let lastImportAt = null;

  courses.forEach((course) => {
    courseMap.set(course._id.toString(), {
      courseId: course._id.toString(),
      name: course.name,
      code: course.code,
      teacher: {
        name: course.teacher?.name || '',
        email: course.teacher?.email || '',
      },
      records: [],
      uniqueStudents: new Set(),
    });
  });

  results.forEach((result) => {
    const courseId = result.course?._id?.toString();
    if (!courseId || !courseMap.has(courseId)) {
      return;
    }

    const percentage = Number.isFinite(result.percentage)
      ? result.percentage
      : computePercentage(result.marksObtained, result.totalMarks);

    const courseEntry = courseMap.get(courseId);
    courseEntry.records.push({
      id: result._id.toString(),
      examTitle: result.examTitle,
      examDate: result.examDate,
      student: {
        name: result.student?.name || 'Student',
        email: result.student?.email || '',
        studentId: result.student?.studentId || '',
        department: result.student?.department || '',
      },
      marksObtained: result.marksObtained,
      totalMarks: result.totalMarks,
      percentage: Number.isFinite(percentage) ? Math.round(percentage * 100) / 100 : null,
      grade: result.grade || computeGrade(percentage),
      metadata: {
        term: result.metadata?.term || '',
        examType: result.metadata?.examType || '',
        remarks: result.metadata?.remarks || '',
      },
      uploadedBy: {
        name: result.uploadedBy?.name || '',
        email: result.uploadedBy?.email || '',
      },
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });

    const studentId = result.student?._id?.toString();
    if (studentId) {
      courseEntry.uniqueStudents.add(studentId);
      globalStudents.add(studentId);
    }

    totalRecords += 1;

    const updatedAt = result.updatedAt || result.createdAt;
    if (updatedAt) {
      const timestamp = new Date(updatedAt);
      if (!Number.isNaN(timestamp.valueOf())) {
        if (!lastImportAt || timestamp > lastImportAt) {
          lastImportAt = timestamp;
        }
      }
    }
  });

  const courseSummaries = Array.from(courseMap.values()).map((entry) => ({
    courseId: entry.courseId,
    name: entry.name,
    code: entry.code,
    teacher: entry.teacher,
    totalRecords: entry.records.length,
    uniqueStudents: entry.uniqueStudents.size,
    records: entry.records.sort((a, b) => {
      const dateA = a.examDate ? new Date(a.examDate) : new Date(0);
      const dateB = b.examDate ? new Date(b.examDate) : new Date(0);
      return dateB - dateA;
    }),
  }));

  return {
    mode: 'teacher',
    summary: {
      totalCourses: courses.length,
      totalRecords,
      uniqueStudents: globalStudents.size,
      lastImportAt,
    },
    courses: courseSummaries,
  };
};

// @desc    Get results for the current user (student view)
// @route   GET /api/v1/results
// @access  Private
exports.getResults = async (req, res, next) => {
  try {
    const data = await buildStudentResults(req.user._id || req.user.id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher exam results overview
// @route   GET /api/v1/results/teacher
// @access  Private (Teacher/Admin)
exports.getTeacherResults = async (req, res, next) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return next(new ErrorResponse('Not authorized to access teacher results', 403));
    }

    const options = {
      courseId: req.query.courseId || undefined,
    };

    if (req.user.role === 'admin' && req.query.teacherId) {
      options.teacherId = req.query.teacherId;
    }

    const data = await buildTeacherResults(req.user, options);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload exam results via Excel
// @route   POST /api/v1/results/upload
// @access  Private (Teacher/Admin)
exports.uploadExamResults = async (req, res, next) => {
  let filePath;

  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return next(new ErrorResponse('Not authorized to upload results', 403));
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload an Excel file (.xlsx or .xls)', 400));
    }

    filePath = req.file.path;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      return next(new ErrorResponse('The uploaded workbook does not contain any sheets', 400));
    }

    const headerRow = worksheet.getRow(1);
    const headerMap = {};

    headerRow.eachCell((cell, colNumber) => {
      const key = normalizeString(cell.value).toLowerCase();
      if (key) {
        headerMap[key] = colNumber;
      }
    });

    const missingColumns = REQUIRED_COLUMNS.filter((column) => !(column in headerMap));
    if (missingColumns.length) {
      return next(
        new ErrorResponse(`Missing required columns: ${missingColumns.join(', ')}`, 400)
      );
    }

    const summary = {
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    const isTeacher = req.user.role === 'teacher';
    const rowCount = worksheet.actualRowCount || worksheet.rowCount;

    for (let rowIndex = 2; rowIndex <= rowCount; rowIndex += 1) {
      const row = worksheet.getRow(rowIndex);

      const studentEmail = normalizeString(row.getCell(headerMap['student email']).value).toLowerCase();
      const courseCode = normalizeString(row.getCell(headerMap['course code']).value).toUpperCase();
      const examTitle = normalizeString(row.getCell(headerMap['exam title']).value);
      const marksObtained = toNumber(row.getCell(headerMap['marks obtained']).value);
      const totalMarks = toNumber(row.getCell(headerMap['total marks']).value);
      const examDateRaw = headerMap['exam date']
        ? row.getCell(headerMap['exam date']).value
        : null;
      const term = headerMap['term'] ? normalizeString(row.getCell(headerMap['term']).value) : '';
      const examType = headerMap['exam type']
        ? normalizeString(row.getCell(headerMap['exam type']).value)
        : '';
      const remarks = headerMap['remarks'] ? normalizeString(row.getCell(headerMap['remarks']).value) : '';

      const isEmptyRow = [studentEmail, courseCode, examTitle, marksObtained, totalMarks]
        .map((value) => (value === null || value === '' ? null : value))
        .every((value) => value === null);

      if (isEmptyRow) {
        continue;
      }

      summary.processed += 1;

      try {
        if (!studentEmail || !courseCode || !examTitle) {
          throw new Error('Student email, course code, and exam title are required');
        }

        const student = await User.findOne({ email: studentEmail }).select(
          '_id name email studentId department'
        );

        if (!student) {
          throw new Error(`Student not found for email ${studentEmail}`);
        }

        const course = await Course.findOne({ code: courseCode }).select('_id teacher name code');
        if (!course) {
          throw new Error(`Course not found for code ${courseCode}`);
        }

        if (
          isTeacher &&
          course.teacher?.toString() !== (req.user._id || req.user.id).toString()
        ) {
          throw new Error('You are not assigned to this course');
        }

        if (!Number.isFinite(marksObtained) || !Number.isFinite(totalMarks)) {
          throw new Error('Marks obtained and total marks must be numbers');
        }

        if (marksObtained < 0 || totalMarks <= 0 || marksObtained > totalMarks) {
          throw new Error('Marks obtained must be within the valid range');
        }

        const examDate = parseDate(examDateRaw);
        const percentage = computePercentage(marksObtained, totalMarks);
        const grade = computeGrade(percentage);

        const existing = await ExamResult.findOne({
          examTitle,
          course: course._id,
          student: student._id,
        });

        if (existing) {
          existing.examDate = examDate;
          existing.marksObtained = marksObtained;
          existing.totalMarks = totalMarks;
          existing.percentage = percentage;
          existing.grade = grade;
          existing.metadata = {
            term,
            examType,
            remarks,
          };
          existing.uploadedBy = req.user._id || req.user.id;
          await existing.save();
          summary.updated += 1;
        } else {
          await ExamResult.create({
            examTitle,
            examDate,
            course: course._id,
            student: student._id,
            marksObtained,
            totalMarks,
            percentage,
            grade,
            uploadedBy: req.user._id || req.user.id,
            metadata: {
              term,
              examType,
              remarks,
            },
          });
          summary.created += 1;
        }
      } catch (error) {
        summary.skipped += 1;
        summary.errors.push({
          row: rowIndex,
          message: error.message || 'Unknown error',
        });
      }
    }

    res.status(201).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  } finally {
    if (filePath) {
      await fs.unlink(filePath).catch(() => undefined);
    }
  }
};
