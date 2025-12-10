import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { TrendingUp, Bookmark, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from '../../lib/axios';
import './ResultsPage.css';

export const ResultsPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      const response = await axios.get('/results');
      return response.data?.data || null;
    },
  });

  const gradeDistribution = useMemo(() => {
    if (!data?.gradeDistribution) {
      return [];
    }
    return [
      { label: 'A', count: data.gradeDistribution.A || 0 },
      { label: 'B', count: data.gradeDistribution.B || 0 },
      { label: 'C', count: data.gradeDistribution.C || 0 },
      { label: 'D', count: data.gradeDistribution.D || 0 },
      { label: 'F', count: data.gradeDistribution.F || 0 },
    ];
  }, [data?.gradeDistribution]);

  const subjectScores = data?.subjectWise || [];
  const recentPerformance = data?.recentPerformance || [];
  const assignments = data?.assignments || [];

  const maxTrendScore = recentPerformance.reduce((max, item) => Math.max(max, item.percentage || 0), 0) || 100;
  const maxSubjectScore = subjectScores.reduce((max, item) => Math.max(max, item.score || 0), 0) || 100;

  if (isLoading) {
    return (
      <div className="results-page">
        <div className="results-loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="results-page">
        <div className="results-error">
          <p>Unable to load your results right now. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="results-header"
      >
        <div>
          <h1 className="results-title">Results & Performance</h1>
          <p className="results-subtitle">Track your academic progress and achievements</p>
        </div>
      </motion.div>

      <div className="results-stats">
        <Card className="results-stat-card">
          <CardContent className="results-stat-content">
            <Target className="results-stat-icon" />
            <div className="results-stat-info">
              <p className="results-stat-label">Overall Average</p>
              <p className="results-stat-value">{data.overallAverage?.toFixed(1) ?? '0.0'}%</p>
              <p className="results-stat-change">
                <TrendingUp className="h-4 w-4" />
                {recentPerformance.length > 1
                  ? `${Math.round(
                      (recentPerformance[recentPerformance.length - 1].percentage || 0) -
                        (recentPerformance[0].percentage || 0)
                    )} points`
                  : 'Keep going!'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="results-stat-card">
          <CardContent className="results-stat-content">
            <Bookmark className="results-stat-icon" />
            <div className="results-stat-info">
              <p className="results-stat-label">Exams Graded</p>
              <p className="results-stat-value">{data.totalGraded}</p>
              <p className="results-stat-change">Across all submitted assignments</p>
            </div>
          </CardContent>
        </Card>

        <Card className="results-stat-card">
          <CardContent className="results-stat-content">
            <TrendingUp className="results-stat-icon" />
            <div className="results-stat-info">
              <p className="results-stat-label">Highest Score</p>
              <p className="results-stat-value">
                {data.highestScore ? `${data.highestScore.percentage}%` : 'N/A'}
              </p>
              <p className="results-stat-change">
                {data.highestScore ? `${data.highestScore.title} – ${data.highestScore.courseName}` : 'Awaiting grades'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="results-stat-card">
          <CardContent className="results-stat-content">
            <TrendingUp className="results-stat-icon" />
            <div className="results-stat-info">
              <p className="results-stat-label">Latest Trend</p>
              <p className="results-stat-value">
                {recentPerformance.length > 0
                  ? `${recentPerformance[recentPerformance.length - 1].percentage}%`
                  : '–'}
              </p>
              <p className="results-stat-change">Most recent graded submission</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="results-grid">
        <Card className="results-chart-card">
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPerformance.length > 0 ? (
              <div className="results-line-chart">
                {recentPerformance.map((item) => (
                  <div key={item.label} className="results-chart-point">
                    <div
                      className="results-chart-bar"
                      style={{ height: `${(item.percentage / maxTrendScore) * 100}%` }}
                    />
                    <p className="results-chart-label">{item.label}</p>
                    <p className="results-chart-value">{item.percentage}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="results-empty">No graded submissions yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="results-subjects-card">
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectScores.length > 0 ? (
              <div className="results-subjects-chart">
                {subjectScores.map((subject) => (
                  <div key={subject.subject} className="results-subject-bar">
                    <p className="results-subject-label">{subject.subject}</p>
                    <div className="results-subject-bar-container">
                      <div
                        className="results-subject-bar-fill"
                        style={{ width: `${(subject.score / maxSubjectScore) * 100}%` }}
                      />
                    </div>
                    <p className="results-subject-score">{subject.score}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="results-empty">Grades will appear here once available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="results-grade-card">
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {gradeDistribution.length > 0 ? (
            <div className="results-grade-distribution">
              {gradeDistribution.map((item) => (
                <div key={item.label} className="results-grade-block">
                  <div className="results-grade-letter">{item.label}</div>
                  <div className="results-grade-count">{item.count}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="results-empty">No graded exams to show yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="results-assignments-card">
        <CardHeader>
          <CardTitle>Exam & Assignment Marks</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length > 0 ? (
            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Assessment</th>
                    <th>Course</th>
                    <th>Teacher</th>
                    <th>Marks</th>
                    <th>Percentage</th>
                    <th>Graded On</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <p className="results-table-title">{entry.title}</p>
                        {entry.courseCode && <span className="results-table-code">{entry.courseCode}</span>}
                      </td>
                      <td>{entry.courseName}</td>
                      <td>{entry.teacher}</td>
                      <td>
                        {entry.grade}/{entry.pointsPossible}
                      </td>
                      <td>{entry.percentage}%</td>
                      <td>{entry.gradedAt ? new Date(entry.gradedAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="results-empty">No graded submissions yet. Once teachers grade your work, details will appear here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
