const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const ExcelJS = require('exceljs');

// @desc    Get attendance for current user
// @route   GET /api/v1/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.query;

    let query = { student: userId };
    if (courseId) {
      query.course = courseId;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('course', 'name code')
      .sort({ date: -1 });

    // Calculate overall attendance
    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter((a) => a.status === 'present').length;
    const lateClasses = attendanceRecords.filter((a) => a.status === 'late').length;
    const overallPercentage = totalClasses > 0 ? Math.round(((presentClasses + lateClasses * 0.5) / totalClasses) * 100) : 0;

    // Calculate by course
    const courseStats = {};
    attendanceRecords.forEach((record) => {
      const courseId = record.course._id.toString();
      if (!courseStats[courseId]) {
        courseStats[courseId] = {
          course: record.course,
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
        };
      }
      courseStats[courseId].total++;
      if (record.status === 'present') courseStats[courseId].present++;
      if (record.status === 'late') courseStats[courseId].late++;
      if (record.status === 'absent') courseStats[courseId].absent++;
    });

    const subjectWise = Object.values(courseStats).map((stat) => ({
      name: stat.course.name,
      present: stat.present,
      late: stat.late,
      absent: stat.absent,
      total: stat.total,
      percentage: stat.total > 0 ? Math.round(((stat.present + stat.late * 0.5) / stat.total) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        overall: overallPercentage,
        records: attendanceRecords,
        subjectWise,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get course attendance with students (faculty only)
// @route   GET /api/v1/attendance/course/:courseId
// @access  Private (Faculty/Teacher only)
exports.getCourseAttendance = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { date } = req.query;

    // FACULTY ONLY - Check if user is faculty
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return next(new ErrorResponse('Only faculty can view course attendance', 403));
    }

    const course = await Course.findById(courseId).populate('students', 'name email studentId');

    if (!course) {
      return next(new ErrorResponse('Course not found', 404));
    }

    // Check if teacher teaches this course
    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to view this course attendance', 403));
    }

    let attendanceRecords = [];
    if (date) {
      // Get attendance for specific date
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      attendanceRecords = await Attendance.find({
        course: courseId,
        date: { $gte: startDate, $lte: endDate },
      }).populate('student', 'name email studentId');
    }

    res.status(200).json({
      success: true,
      data: {
        course,
        attendance: attendanceRecords,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark bulk attendance (faculty only)
// @route   POST /api/v1/attendance/mark-bulk
// @access  Private (Faculty/Teacher only)
exports.markBulkAttendance = async (req, res, next) => {
  try {
    const { courseId, date, attendanceData } = req.body;

    // FACULTY ONLY - Check if user is faculty
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return next(new ErrorResponse('Only faculty can mark attendance', 403));
    }

    if (!courseId || !date || !attendanceData || !Array.isArray(attendanceData)) {
      return next(new ErrorResponse('Please provide courseId, date, and attendanceData array', 400));
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new ErrorResponse('Course not found', 404));
    }

    // Check if teacher teaches this course
    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to mark attendance for this course', 403));
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const results = [];

    for (const record of attendanceData) {
      const { studentId, status } = record;

      if (!['present', 'absent', 'late'].includes(status)) {
        continue;
      }

      let attendance = await Attendance.findOne({
        student: studentId,
        course: courseId,
        date: { $gte: attendanceDate, $lt: nextDay },
      });

      if (attendance) {
        attendance.status = status;
        attendance.markedBy = req.user.id;
        await attendance.save();
      } else {
        attendance = await Attendance.create({
          student: studentId,
          course: courseId,
          date: attendanceDate,
          status,
          markedBy: req.user.id,
        });
      }

      results.push(attendance);
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export faculty attendance (all students, all subjects) - FACULTY ONLY
// @route   GET /api/v1/attendance/export/faculty
// @access  Private (Faculty/Teacher only)
exports.exportFacultyAttendance = async (req, res, next) => {
  try {
    // FACULTY ONLY - Check if user is faculty
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return next(new ErrorResponse('Only faculty can export attendance', 403));
    }

    const courses = await Course.find(
      req.user.role === 'teacher' ? { teacher: req.user.id } : {}
    ).populate('students', 'name email studentId');

    const workbook = new ExcelJS.Workbook();
    const summaryData = {};

    for (const course of courses) {
      const sheet = workbook.addWorksheet(course.code);

      sheet.columns = [
        { header: 'USN', key: 'usn', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Total Classes', key: 'total', width: 15 },
        { header: 'Present', key: 'present', width: 12 },
        { header: 'Absent', key: 'absent', width: 12 },
        { header: 'Late', key: 'late', width: 12 },
        { header: 'Percentage', key: 'percentage', width: 15 },
      ];

      for (const student of course.students) {
        const attendance = await Attendance.find({
          course: course._id,
          student: student._id,
        });

        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'present').length;
        const absent = attendance.filter(a => a.status === 'absent').length;
        const late = attendance.filter(a => a.status === 'late').length;
        const percentage = total > 0 ? ((present + late * 0.5) / total) * 100 : 0;

        sheet.addRow({
          usn: student.studentId || 'N/A',
          name: student.name,
          total,
          present,
          absent,
          late,
          percentage: `${percentage.toFixed(2)}%`,
        });

        if (!summaryData[student._id]) {
          summaryData[student._id] = {
            usn: student.studentId || 'N/A',
            name: student.name,
            subjects: {},
          };
        }
        summaryData[student._id].subjects[course.code] = percentage.toFixed(2);
      }

      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
    }

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    const summaryColumns = [
      { header: 'USN', key: 'usn', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
    ];

    courses.forEach(course => {
      summaryColumns.push({
        header: course.code,
        key: course.code,
        width: 12,
      });
    });
    summaryColumns.push({ header: 'Overall', key: 'overall', width: 12 });

    summarySheet.columns = summaryColumns;

    Object.values(summaryData).forEach(studentData => {
      const row = {
        usn: studentData.usn,
        name: studentData.name,
      };

      let totalPercentage = 0;
      let subjectCount = 0;

      courses.forEach(course => {
        const percentage = studentData.subjects[course.code] || '0';
        row[course.code] = `${percentage}%`;
        totalPercentage += parseFloat(percentage);
        if (parseFloat(percentage) > 0) subjectCount++;
      });

      row.overall = subjectCount > 0 ? `${(totalPercentage / subjectCount).toFixed(2)}%` : '0%';
      summarySheet.addRow(row);
    });

    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// @desc    Export student attendance (individual student)
// @route   GET /api/v1/attendance/export/student
// @access  Private (Students)
exports.exportStudentAttendance = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const attendance = await Attendance.find({ student: studentId })
      .populate('course', 'name code')
      .sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Subject', key: 'subject', width: 30 },
      { header: 'Total Classes', key: 'total', width: 15 },
      { header: 'Present', key: 'present', width: 12 },
      { header: 'Absent', key: 'absent', width: 12 },
      { header: 'Late', key: 'late', width: 12 },
      { header: 'Percentage', key: 'percentage', width: 15 },
    ];

    const subjectWise = {};
    attendance.forEach(record => {
      const courseCode = record.course.code;
      if (!subjectWise[courseCode]) {
        subjectWise[courseCode] = {
          subject: `${record.course.code} - ${record.course.name}`,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
        };
      }
      subjectWise[courseCode].total++;
      if (record.status === 'present') subjectWise[courseCode].present++;
      if (record.status === 'absent') subjectWise[courseCode].absent++;
      if (record.status === 'late') subjectWise[courseCode].late++;
    });

    Object.values(subjectWise).forEach(subject => {
      const percentage = subject.total > 0 ? ((subject.present + subject.late * 0.5) / subject.total) * 100 : 0;
      summarySheet.addRow({
        ...subject,
        percentage: `${percentage.toFixed(2)}%`,
      });
    });

    const detailsSheet = workbook.addWorksheet('Detailed Records');
    detailsSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Subject', key: 'subject', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    attendance.forEach(record => {
      detailsSheet.addRow({
        date: new Date(record.date).toLocaleDateString(),
        subject: `${record.course.code} - ${record.course.name}`,
        status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
      });
    });

    [summarySheet, detailsSheet].forEach(sheet => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
    });

    const user = await User.findById(studentId);
    const fileName = `My_Attendance_${user.studentId || studentId}_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};
