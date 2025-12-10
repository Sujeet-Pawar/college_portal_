const User = require('../models/User');
const { verifyToken, getTokenFromHeader } = require('../utils/jwtUtils');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token = getTokenFromHeader(req);

    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new ErrorResponse('User no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
