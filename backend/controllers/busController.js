const Bus = require('../models/Bus');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all buses
// @route   GET /api/v1/bus-tracking
// @access  Private
exports.getBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find({ isActive: true }).sort({ routeNumber: 1 });

    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single bus
// @route   GET /api/v1/bus-tracking/:id
// @access  Private
exports.getBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return next(new ErrorResponse(`Bus not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: bus,
    });
  } catch (err) {
    next(err);
  }
};

