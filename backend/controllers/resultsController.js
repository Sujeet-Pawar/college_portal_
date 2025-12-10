const Assignment = require('../models/Assignment');

// @desc    Get results for current user
// @route   GET /api/v1/results
// @access  Private
exports.getResults = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const assignments = await Assignment.find({
      'submissions.student': userId,
    })
      .populate('course', 'name code')
      .populate('teacher', 'name');

    const gradedEntries = [];

    assignments.forEach((assignment) => {
      const submission = assignment.submissions.find(
        (s) => s.student.toString() === userId.toString()
      );

      if (!submission || submission.grade === undefined || submission.grade === null) {
        return;
      }

      gradedEntries.push({
        assignment,
        submission,
      });
    });

    gradedEntries.sort((a, b) => {
      const dateA =
        a.submission.gradedAt ||
        a.submission.submittedAt ||
        a.assignment.updatedAt ||
        a.assignment.createdAt;
      const dateB =
        b.submission.gradedAt ||
        b.submission.submittedAt ||
        b.assignment.updatedAt ||
        b.assignment.createdAt;
      return new Date(dateB) - new Date(dateA);
    });

    const totalGraded = gradedEntries.length;

    let totalPercent = 0;
    let highestEntry = null;
    const subjectMap = new Map();
    const gradeBuckets = { A: 0, B: 0, C: 0, D: 0, F: 0 };

    const assignmentsData = gradedEntries.map(({ assignment, submission }) => {
      const pointsPossible = assignment.points || 100;
      const grade = submission.grade ?? 0;
      const percentage = pointsPossible > 0 ? (grade / pointsPossible) * 100 : 0;

      totalPercent += percentage;

      if (!highestEntry || percentage > highestEntry.percentage) {
        highestEntry = {
          percentage,
          title: assignment.title,
          courseName: assignment.course?.name || 'Course',
        };
      }

      const courseId = assignment.course?._id?.toString();
      const courseName = assignment.course?.name || 'Course';
      if (courseId) {
        if (!subjectMap.has(courseId)) {
          subjectMap.set(courseId, { subject: courseName, percentages: [] });
        }
        subjectMap.get(courseId).percentages.push(percentage);
      }

      if (percentage >= 90) gradeBuckets.A += 1;
      else if (percentage >= 80) gradeBuckets.B += 1;
      else if (percentage >= 70) gradeBuckets.C += 1;
      else if (percentage >= 60) gradeBuckets.D += 1;
      else gradeBuckets.F += 1;

      return {
        id: assignment._id.toString(),
        title: assignment.title,
        courseName,
        courseCode: assignment.course?.code || '',
        teacher: assignment.teacher?.name || 'Teacher',
        pointsPossible,
        grade,
        percentage: Math.round(percentage * 10) / 10,
        gradedAt: submission.gradedAt || submission.submittedAt,
      };
    });

    const overallAverage = totalGraded > 0 ? totalPercent / totalGraded : 0;

    const subjectWise = Array.from(subjectMap.values()).map(({ subject, percentages }) => ({
      subject,
      score: Math.round(
        percentages.reduce((sum, value) => sum + value, 0) / percentages.length
      ),
    }));

    const recentPerformance = gradedEntries
      .slice(0, 6)
      .map(({ assignment, submission }) => {
        const pointsPossible = assignment.points || 100;
        const grade = submission.grade ?? 0;
        const percentage = pointsPossible > 0 ? (grade / pointsPossible) * 100 : 0;
        const date = submission.gradedAt || submission.submittedAt;

        return {
          label: date
            ? new Date(date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            : assignment.title,
          percentage: Math.round(percentage),
        };
      })
      .reverse();

    res.status(200).json({
      success: true,
      data: {
        overallAverage: Math.round(overallAverage * 10) / 10,
        totalGraded,
        highestScore: highestEntry
          ? {
              percentage: Math.round(highestEntry.percentage * 10) / 10,
              title: highestEntry.title,
              courseName: highestEntry.courseName,
            }
          : null,
        subjectWise,
        assignments: assignmentsData,
        recentPerformance,
        gradeDistribution: gradeBuckets,
      },
    });
  } catch (err) {
    next(err);
  }
};

