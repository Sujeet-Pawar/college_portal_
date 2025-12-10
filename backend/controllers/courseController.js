const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Allow teachers to request only their courses with ?teacher=me
    if (reqQuery.teacher === 'me' && req.user) {
      reqQuery.teacher = req.user.id;
    }

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    query = Course.find(JSON.parse(queryStr)).populate('teacher', 'name email');

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Course.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const courses = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: courses.length,
      pagination,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email studentId');

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new course
// @route   POST /api/v1/courses
// @access  Private/Admin/Teacher
exports.createCourse = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ErrorResponse('User context missing', 401));
    }

    if (!Array.isArray(req.body.schedule) || req.body.schedule.length === 0) {
      return next(new ErrorResponse('Please provide at least one schedule entry', 400));
    }

    const sanitizedSchedule = req.body.schedule.map((slot) => ({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      room: slot.room,
    }));

    req.body.schedule = sanitizedSchedule;

    if (req.body.code) {
      req.body.code = String(req.body.code).trim().toUpperCase();
    }

    // Add user to req.body
    req.body.teacher = req.user.id;

    let course = await Course.create(req.body);

    try {
      const timetablePayload = sanitizedSchedule.map((slot) => ({
        course: course._id,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        room: slot.room,
        professor: req.user.id,
      }));

      await Timetable.insertMany(timetablePayload);
    } catch (error) {
      await Course.findByIdAndDelete(course._id);
      return next(new ErrorResponse('Unable to create timetable entries for course', 400));
    }

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private/Admin/Teacher
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is course teacher or admin
    if (
      course.teacher.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this course`,
          401
        )
      );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private/Admin/Teacher
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is course teacher or admin
    if (
      course.teacher.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this course`,
          401
        )
      );
    }

    await course.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Enroll student in course
// @route   PUT /api/v1/courses/:id/enroll
// @access  Private
exports.enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if already enrolled
    if (
      course.students.some(
        (student) => student.toString() === req.user.id.toString()
      )
    ) {
      return next(
        new ErrorResponse(`Student is already enrolled in this course`, 400)
      );
    }

    // Add student to course
    course.students.push(req.user.id);
    await course.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add resource to course
// @route   POST /api/v1/courses/:id/resources
// @access  Private/Teacher
exports.addResource = async (req, res, next) => {
  try {
    const { title, description, fileUrl, fileType } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is course teacher or admin
    if (
      course.teacher.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add resources to this course`,
          401
        )
      );
    }

    const newResource = {
      title,
      description,
      fileUrl,
      fileType,
      uploadedBy: req.user.id,
    };

    course.resources.unshift(newResource);
    await course.save();

    res.status(200).json({
      success: true,
      data: course.resources[0],
    });
  } catch (err) {
    next(err);
  }
};
