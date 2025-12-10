const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { generateToken } = require('../utils/jwtUtils');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, studentId, phone } = req.body;

    console.log('Registration attempt:', { name, email, role, department, hasPassword: !!password });

    // Validate required fields
    if (!name || !email || !password) {
      return next(new ErrorResponse('Please provide name, email, and password', 400));
    }

    if (!department) {
      return next(new ErrorResponse('Please provide a department', 400));
    }

    if (password.length < 6) {
      return next(new ErrorResponse('Password must be at least 6 characters', 400));
    }

    // Clean up empty strings to undefined
    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role || 'student',
      department: department.trim(),
      studentId: studentId && studentId.trim() ? studentId.trim() : undefined,
      phone: phone && phone.trim() ? phone.trim() : undefined,
    };

    // Create user
    const user = await User.create(userData);
    console.log('User created successfully:', user.email);

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Registration error:', err);
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {},
  });
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, department } = req.body;

    // Validation constraints

    // Validate name
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return next(new ErrorResponse('Name must be at least 2 characters long', 400));
      }
      if (trimmedName.length > 50) {
        return next(new ErrorResponse('Name must not exceed 50 characters', 400));
      }
      if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
        return next(new ErrorResponse('Name can only contain letters and spaces', 400));
      }
    }

    // Validate email
    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return next(new ErrorResponse('Please provide a valid email address', 400));
      }

      // Check if email is being changed and if it's already taken
      if (trimmedEmail !== req.user.email) {
        const emailExists = await User.findOne({ email: trimmedEmail });
        if (emailExists) {
          return next(new ErrorResponse('Email already in use', 400));
        }
      }
    }

    // Validate phone
    if (phone !== undefined && phone.trim() !== '') {
      const trimmedPhone = phone.trim();

      // Check if phone contains any letters
      if (/[a-zA-Z]/.test(trimmedPhone)) {
        return next(new ErrorResponse('Phone number cannot contain letters', 400));
      }

      // Allow formats: 1234567890, +911234567890, +1-234-567-8900
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,6}$/;
      if (!phoneRegex.test(trimmedPhone)) {
        return next(new ErrorResponse('Please provide a valid phone number (numbers only)', 400));
      }
      if (trimmedPhone.replace(/\D/g, '').length < 10) {
        return next(new ErrorResponse('Phone number must be at least 10 digits', 400));
      }
    }

    // Validate department
    if (department !== undefined) {
      const trimmedDepartment = department.trim();
      if (trimmedDepartment.length < 2) {
        return next(new ErrorResponse('Department must be at least 2 characters long', 400));
      }
      if (trimmedDepartment.length > 100) {
        return next(new ErrorResponse('Department must not exceed 100 characters', 400));
      }
    }

    // Fields to update
    const fieldsToUpdate = {};

    if (name !== undefined) fieldsToUpdate.name = name.trim();
    if (email !== undefined) fieldsToUpdate.email = email.trim().toLowerCase();
    if (phone !== undefined) fieldsToUpdate.phone = phone.trim();
    if (department !== undefined) fieldsToUpdate.department = department.trim();

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
