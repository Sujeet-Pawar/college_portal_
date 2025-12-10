const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');

const ensureCourseAccess = async (courseId, user) => {
  const course = await Course.findById(courseId).select('teacher');

  if (!course) {
    throw new ErrorResponse('Course not found', 404);
  }

  if (user.role === 'teacher' && course.teacher?.toString() !== user.id) {
    throw new ErrorResponse('Not authorized to manage timetable for this course', 403);
  }

  return course;
};

// @desc    Get timetable for current user
// @route   GET /api/v1/timetable
// @access  Private
exports.getTimetable = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let timetable = [];

    if (userRole === 'student') {
      // Get courses enrolled by student
      const courses = await Course.find({ students: userId });
      const courseIds = courses.map((c) => c._id);

      timetable = await Timetable.find({ course: { $in: courseIds } })
        .populate('course', 'name code')
        .populate('professor', 'name')
        .sort({ day: 1, startTime: 1 });
    } else if (userRole === 'teacher') {
      timetable = await Timetable.find({ professor: userId })
        .populate('course', 'name code')
        .populate('professor', 'name')
        .sort({ day: 1, startTime: 1 });
    } else if (userRole === 'admin') {
      timetable = await Timetable.find()
        .populate('course', 'name code')
        .populate('professor', 'name')
        .sort({ day: 1, startTime: 1 });
    }

    // Get current and next class
    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    const currentClass = timetable.find((item) => {
      if (item.day !== currentDay) return false;
      const [startHour, startMin] = item.startTime.split(':').map(Number);
      const [endHour, endMin] = item.endTime.split(':').map(Number);
      const start = startHour * 60 + startMin;
      const end = endHour * 60 + endMin;
      const current = now.getHours() * 60 + now.getMinutes();
      return current >= start && current <= end;
    });

    const nextClass = timetable.find((item) => {
      if (item.day !== currentDay) return false;
      const [startHour, startMin] = item.startTime.split(':').map(Number);
      const start = startHour * 60 + startMin;
      const current = now.getHours() * 60 + now.getMinutes();
      return start > current;
    });

    res.status(200).json({
      success: true,
      data: {
        timetable,
        currentClass,
        nextClass,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create timetable entry
// @route   POST /api/v1/timetable
// @access  Private (Teacher/Admin)
exports.createTimetableEntry = async (req, res, next) => {
  try {
    const { course: courseId, day, startTime, endTime, room, professor } = req.body;

    if (!courseId || !day || !startTime || !endTime || !room) {
      return next(new ErrorResponse('course, day, startTime, endTime and room are required', 400));
    }

    const course = await ensureCourseAccess(courseId, req.user);

    const professorId = req.user.role === 'teacher'
      ? req.user.id
      : professor || course.teacher || req.user.id;

    const entry = await Timetable.create({
      course: courseId,
      day,
      startTime,
      endTime,
      room,
      professor: professorId,
    });

    const populated = await Timetable.findById(entry._id)
      .populate('course', 'name code')
      .populate('professor', 'name');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update timetable entry
// @route   PUT /api/v1/timetable/:id
// @access  Private (Teacher/Admin)
exports.updateTimetableEntry = async (req, res, next) => {
  try {
    const entry = await Timetable.findById(req.params.id);

    if (!entry) {
      return next(new ErrorResponse('Timetable entry not found', 404));
    }

    if (req.user.role === 'teacher' && entry.professor?.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this entry', 403));
    }

    const updates = {};
    const { course: courseId, day, startTime, endTime, room, professor } = req.body;

    if (courseId && courseId.toString() !== entry.course.toString()) {
      const course = await ensureCourseAccess(courseId, req.user);
      updates.course = courseId;
      if (req.user.role === 'admin') {
        updates.professor = professor || course.teacher || entry.professor;
      } else {
        updates.professor = req.user.id;
      }
    }

    if (day) {
      updates.day = day;
    }
    if (startTime) {
      updates.startTime = startTime;
    }
    if (endTime) {
      updates.endTime = endTime;
    }
    if (room) {
      updates.room = room;
    }

    if (req.user.role === 'admin' && professor && !updates.professor) {
      updates.professor = professor;
    }

    if (req.user.role === 'teacher') {
      updates.professor = req.user.id;
    }

    Object.assign(entry, updates);
    await entry.save();

    const populated = await Timetable.findById(entry._id)
      .populate('course', 'name code')
      .populate('professor', 'name');

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete timetable entry
// @route   DELETE /api/v1/timetable/:id
// @access  Private (Teacher/Admin)
exports.deleteTimetableEntry = async (req, res, next) => {
  try {
    const entry = await Timetable.findById(req.params.id);

    if (!entry) {
      return next(new ErrorResponse('Timetable entry not found', 404));
    }

    if (req.user.role === 'teacher' && entry.professor?.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this entry', 403));
    }

    await entry.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

