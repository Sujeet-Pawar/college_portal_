const Assignment = require('../models/Assignment');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

const formatDate = (date) => {
  if (!date) {
    return null;
  }
  const iso = new Date(date).toISOString();
  return iso.split('T')[0];
};

const buildBadge = ({
  id,
  name,
  description,
  icon,
  color,
  progress,
  earnedDate,
}) => ({
  id,
  name,
  description,
  icon,
  color,
  progress: Math.max(0, Math.min(100, Math.round(progress))),
  earnedDate: earnedDate ? formatDate(earnedDate) : null,
});

// @desc    Get achievements for current user
// @route   GET /api/v1/achievements
// @access  Private
exports.getAchievements = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const assignments = await Assignment.find()
      .populate('course', 'name code')
      .populate('submissions.student', 'name email');

    const studentStats = new Map();

    assignments.forEach((assignment) => {
      const totalPoints = assignment.points || 100;
      assignment.submissions.forEach((submission) => {
        if (!submission?.student) {
          return;
        }

        if (submission.grade === undefined || submission.grade === null) {
          return;
        }

        const studentId = submission.student._id
          ? submission.student._id.toString()
          : submission.student.toString();

        if (!studentStats.has(studentId)) {
          studentStats.set(studentId, {
            studentId,
            name: submission.student.name || 'Unknown',
            email: submission.student.email,
            totalPercent: 0,
            totalScore: 0,
            totalPossible: 0,
            submissions: 0,
            bestPercent: 0,
            latestDate: null,
            courseScores: new Map(),
          });
        }

        const stats = studentStats.get(studentId);
        const percent = (submission.grade / totalPoints) * 100;

        stats.totalPercent += percent;
        stats.totalScore += submission.grade;
        stats.totalPossible += totalPoints;
        stats.submissions += 1;
        stats.bestPercent = Math.max(stats.bestPercent, percent);
        const submissionDate = submission.gradedAt || submission.submittedAt || assignment.updatedAt || assignment.createdAt;
        if (!stats.latestDate || submissionDate > stats.latestDate) {
          stats.latestDate = submissionDate;
        }

        const courseId = assignment.course?._id?.toString();
        const courseName = assignment.course?.name || 'Course';
        if (courseId) {
          if (!stats.courseScores.has(courseId)) {
            stats.courseScores.set(courseId, {
              subject: courseName,
              percents: [],
            });
          }
          stats.courseScores.get(courseId).percents.push(percent);
        }
      });
    });

    const leaderboard = Array.from(studentStats.values())
      .map((stats) => {
        const avgPercent = stats.submissions > 0 ? stats.totalPercent / stats.submissions : 0;
        const initials = stats.name
          ? stats.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
          : 'U';
        return {
          studentId: stats.studentId,
          name: stats.name,
          initials,
          avgPercent,
          points: Math.round(avgPercent),
          submissions: stats.submissions,
        };
      })
      .sort((a, b) => {
        if (b.avgPercent === a.avgPercent) {
          return b.submissions - a.submissions;
        }
        return b.avgPercent - a.avgPercent;
      });

    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    const currentStats = studentStats.get(userId.toString());

    const overallAverage = currentStats && currentStats.submissions > 0
      ? currentStats.totalPercent / currentStats.submissions
      : 0;

    const totalPoints = currentStats ? currentStats.totalScore : 0;
    const streakDays = currentStats ? currentStats.submissions : 0;

    const badges = [];

    badges.push(
      buildBadge({
        id: 'academic-excellence',
        name: 'Academic Excellence',
        description: 'Maintain an average score of 90% or higher.',
        icon: 'trophy',
        color: 'blue',
        progress: overallAverage ? (overallAverage / 90) * 100 : 0,
        earnedDate: overallAverage >= 90 ? currentStats?.latestDate : null,
      })
    );

    badges.push(
      buildBadge({
        id: 'consistent-performer',
        name: 'Consistent Performer',
        description: 'Complete at least 5 graded submissions.',
        icon: 'target',
        color: 'purple',
        progress: currentStats ? (currentStats.submissions / 5) * 100 : 0,
        earnedDate: currentStats && currentStats.submissions >= 5 ? currentStats.latestDate : null,
      })
    );

    badges.push(
      buildBadge({
        id: 'top-score',
        name: 'Top Score',
        description: 'Achieve a perfect score on at least one assignment.',
        icon: 'star',
        color: 'yellow',
        progress: currentStats ? currentStats.bestPercent : 0,
        earnedDate: currentStats && currentStats.bestPercent >= 100 ? currentStats.latestDate : null,
      })
    );

    const badgesEarned = badges.filter((badge) => badge.progress >= 100).length;

    const leaderboardResponse = leaderboardWithRank.slice(0, 10).map((entry) => ({
      rank: entry.rank,
      name: entry.name,
      initials: entry.initials,
      points: entry.points,
      medal: entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : entry.rank === 3 ? 'bronze' : undefined,
      isCurrentUser: entry.studentId === userId.toString(),
    }));

    const classRankEntry = leaderboardWithRank.find((entry) => entry.studentId === userId.toString());

    res.status(200).json({
      success: true,
      data: {
        totalPoints: Math.round(totalPoints),
        badgesEarned,
        classRank: classRankEntry ? classRankEntry.rank : null,
        streakDays,
        badges,
        leaderboard: leaderboardResponse,
      },
    });
  } catch (err) {
    next(err);
  }
};

