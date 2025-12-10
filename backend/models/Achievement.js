const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    badge: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    points: {
      type: Number,
      default: 0,
    },
    earnedDate: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

achievementSchema.index({ student: 1, badge: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);

