const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: true,
      unique: true,
    },
    routeName: {
      type: String,
      required: true,
    },
    stops: [
      {
        name: String,
        location: {
          lat: Number,
          lng: Number,
        },
        order: Number,
      },
    ],
    currentLocation: {
      lat: Number,
      lng: Number,
    },
    nextStop: {
      type: String,
    },
    eta: {
      type: Number, // minutes
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Bus', busSchema);

