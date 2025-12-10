const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get dashboard data
// @route   GET /api/v1/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let dashboardData = {};

    if (userRole === 'student') {
      // Get enrolled courses
      const courses = await Course.find({ students: userId }).populate('teacher', 'name email');

      // Get upcoming assignments
      const upcomingAssignments = await Assignment.find({
        course: { $in: courses.map((c) => c._id) },
        dueDate: { $gte: new Date() },
        'submissions.student': { $ne: userId },
      })
        .populate('course', 'name code')
        .sort({ dueDate: 1 })
        .limit(5);

      // Get today's classes
      const today = new Date();
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
      
      const todaysClasses = courses
        .filter((course) => {
          return course.schedule?.some((s) => s.day === dayOfWeek);
        })
        .map((course) => {
          const schedule = course.schedule.find((s) => s.day === dayOfWeek);
          return {
            _id: course._id,
            course: { name: course.name, code: course.code },
            room: schedule?.room,
            startTime: schedule?.startTime,
            endTime: schedule?.endTime,
          };
        });

      // Count classmates
      const classmatesCount = await User.countDocuments({
        _id: { $ne: userId },
        _id: { $in: courses.flatMap((c) => c.students) },
      });

      dashboardData = {
        activeCourses: courses.length,
        upcomingAssignments: upcomingAssignments.length,
        recentAssignments: upcomingAssignments,
        todaysClasses,
        classmates: classmatesCount,
      };
    } else if (userRole === 'teacher' || userRole === 'admin') {
      const courseQuery = userRole === 'admin' ? {} : { teacher: userId };
      const courses = await Course.find(courseQuery).select('name code createdAt teacher');

      const assignmentQuery = userRole === 'admin' ? {} : { teacher: userId };
      const assignments = await Assignment.find(assignmentQuery)
        .populate('course', 'name code')
        .sort({ createdAt: -1 })
        .limit(5);

      const totalStudents = userRole === 'admin'
        ? await User.countDocuments({ role: 'student' })
        : await User.countDocuments({ _id: { $in: courses.flatMap((course) => course.students || []) } });

      dashboardData = {
        activeCourses: courses.length,
        totalStudents,
        recentAssignments: assignments,
        courses: courses.slice(0, 5),
      };
    }

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (err) {
    next(err);
  }
};

