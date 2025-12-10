import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  TrendingUp,
  Bookmark,
  Target,
  UploadCloud,
  FileSpreadsheet,
  Users,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import './ResultsPage.css';

export const ResultsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSummary, setUploadSummary] = useState(null);

  const isTeacherView = user?.role === 'teacher' || user?.role === 'admin';

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [isTeacherView ? 'teacher-results' : 'student-results', user?._id || user?.id],
    enabled: !!user,
    queryFn: async () => {
      const endpoint = isTeacherView ? '/results/teacher' : '/results';
      const response = await axios.get(endpoint);
      return response.data?.data || null;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('/results/upload', formData);
      return response.data?.data;
    },
    onSuccess: (summary) => {
      setUploadSummary(summary);
      toast({
        title: 'Upload complete',
        description: `Created ${summary.created}, updated ${summary.updated}, skipped ${summary.skipped}.`,
      });
      setSelectedFile(null);
      setIsUploadOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description:
          error.response?.data?.message || error.message || 'Unable to upload exam results.',
        variant: 'destructive',
      });
    },
  });

  const formatDate = (value, options) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString(undefined, options);
    } catch (error) {
      return '—';
    }
  };

  const closeUploadModal = () => {
    setIsUploadOpen(false);
    setSelectedFile(null);
  };

  const handleUploadSubmit = () => {
    if (!selectedFile) {
      toast({
        title: 'Select a file',
        description: 'Please choose a .xlsx or .xls file to upload.',
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate(selectedFile);
  };

  const uploadModal =
    isTeacherView && isUploadOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold">Upload Exam Results</h2>
            <button
              type="button"
              className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
              onClick={closeUploadModal}
              aria-label="Close"
              disabled={uploadMutation.isPending}
            >
              ×
            </button>
          </div>

          <div className="space-y-4 px-6 py-5 text-sm text-slate-200">
            <p className="text-slate-300">
              Upload an Excel sheet containing columns:
              <span className="font-semibold"> student email</span>,
              <span className="font-semibold"> course code</span>,
              <span className="font-semibold"> exam title</span>,
              <span className="font-semibold"> marks obtained</span>, and
              <span className="font-semibold"> total marks</span>.
              Optional columns like <span className="font-semibold">exam date</span>,
              <span className="font-semibold">term</span>, <span className="font-semibold">exam type</span>, and
              <span className="font-semibold">remarks</span> will also be read.
            </p>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wide text-slate-400">
                Excel file
              </label>
              <div className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <input
                  id="exam-upload-input"
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setSelectedFile(file);
                  }}
                />
                <label
                  htmlFor="exam-upload-input"
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-slate-600 bg-slate-900/40 px-4 py-3 text-left text-slate-200 transition hover:border-slate-400"
                >
                  <div>
                    <p className="font-medium">
                      {selectedFile ? selectedFile.name : 'Select .xlsx or .xls file'}
                    </p>
                    <p className="text-xs text-slate-400">Maximum size 10MB.</p>
                  </div>
                  <UploadCloud className="h-5 w-5 text-primary" />
                </label>
                <p className="text-xs text-slate-400">
                  Tip: ensure student emails and course codes match portal records exactly.
                </p>
              </div>
            </div>

            {uploadSummary?.errors?.length ? (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-amber-100">
                <p className="text-xs font-semibold uppercase">Previous upload warnings</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
                  {uploadSummary.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>
                      Row {error.row}: {error.message}
                    </li>
                  ))}
                  {uploadSummary.errors.length > 3 && (
                    <li>and {uploadSummary.errors.length - 3} more…</li>
                  )}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              onClick={closeUploadModal}
              disabled={uploadMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
              onClick={handleUploadSubmit}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Uploading…' : 'Upload Marks'}
            </button>
          </div>
        </div>
      </div>
    ) : null;

  if (isLoading) {
    return (
      <div className="results-page">
        <div className="results-loading">
          <div className="spinner" />
        </div>
        {uploadModal}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="results-page">
        <div className="results-error">
          <p>Unable to load your results right now. Please try again later.</p>
        </div>
        {uploadModal}
      </div>
    );
  }

  if (isTeacherView) {
    const summary = data?.summary || {};
    const courses = data?.courses || [];
    const lastImportDisplay = summary.lastImportAt
      ? formatDate(summary.lastImportAt, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Never';

    return (
      <div className="results-page">
        {uploadModal}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="results-header flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="results-title">Exam Results Management</h1>
            <p className="results-subtitle">
              Upload spreadsheets and review marks across your courses
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <UploadCloud className="h-4 w-4" />
              Upload Excel
            </button>
          </div>
        </motion.div>

        {uploadSummary && (
          <div className="mb-6 rounded-xl border border-primary/40 bg-primary/10 p-4 text-sm text-primary-foreground/90">
            <p className="font-semibold">Last upload summary</p>
            <p className="mt-1">
              Created {uploadSummary.created}, updated {uploadSummary.updated}, skipped {uploadSummary.skipped}.
            </p>
            {uploadSummary.errors?.length ? (
              <p className="mt-1 text-xs text-primary-foreground/70">
                {uploadSummary.errors.length} row(s) produced warnings – review the row numbers for
                details.
              </p>
            ) : null}
          </div>
        )}

        <div className="results-stats">
          <Card className="results-stat-card">
            <CardContent className="results-stat-content">
              <FileSpreadsheet className="results-stat-icon" />
              <div className="results-stat-info">
                <p className="results-stat-label">Courses Covered</p>
                <p className="results-stat-value">{summary.totalCourses ?? 0}</p>
                <p className="results-stat-change">Courses with uploaded exam results</p>
              </div>
            </CardContent>
          </Card>

          <Card className="results-stat-card">
            <CardContent className="results-stat-content">
              <Bookmark className="results-stat-icon" />
              <div className="results-stat-info">
                <p className="results-stat-label">Records Stored</p>
                <p className="results-stat-value">{summary.totalRecords ?? 0}</p>
                <p className="results-stat-change">Unique exam entries captured</p>
              </div>
            </CardContent>
          </Card>

          <Card className="results-stat-card">
            <CardContent className="results-stat-content">
              <Users className="results-stat-icon" />
              <div className="results-stat-info">
                <p className="results-stat-label">Students Covered</p>
                <p className="results-stat-value">{summary.uniqueStudents ?? 0}</p>
                <p className="results-stat-change">Distinct learners across records</p>
              </div>
            </CardContent>
          </Card>

          <Card className="results-stat-card">
            <CardContent className="results-stat-content">
              <TrendingUp className="results-stat-icon" />
              <div className="results-stat-info">
                <p className="results-stat-label">Last Import</p>
                <p className="results-stat-value">{lastImportDisplay}</p>
                <p className="results-stat-change">Most recent spreadsheet processed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-6">
          {courses.length ? (
            courses.map((course) => (
              <Card className="results-assignments-card" key={course.courseId}>
                <CardHeader>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle>
                        {course.name}
                        {course.code ? <span className="results-table-code ml-2">{course.code}</span> : null}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {course.totalRecords} record(s) · {course.uniqueStudents} student(s)
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Uploaded by: {course.teacher?.name || '—'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {course.records.length ? (
                    <div className="results-table-wrapper">
                      <table className="results-table">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Exam</th>
                            <th>Marks</th>
                            <th>Percentage</th>
                            <th>Grade</th>
                            <th>Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.records.map((record) => (
                            <tr key={record.id}>
                              <td>
                                <p className="results-table-title">{record.student?.name || 'Student'}</p>
                                {record.student?.email ? (
                                  <span className="results-table-code">{record.student.email}</span>
                                ) : null}
                              </td>
                              <td>
                                <p className="results-table-title">{record.examTitle}</p>
                                {record.examDate ? (
                                  <span className="results-table-code">
                                    {formatDate(record.examDate, { month: 'short', day: 'numeric' })}
                                  </span>
                                ) : null}
                              </td>
                              <td>
                                {record.marksObtained}/{record.totalMarks}
                              </td>
                              <td>{record.percentage != null ? `${record.percentage}%` : '—'}</td>
                              <td>{record.grade || '—'}</td>
                              <td>{formatDate(record.updatedAt || record.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="results-empty">
                      No exam results uploaded for this course yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="results-assignments-card">
              <CardHeader>
                <CardTitle>No exam data yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="results-empty">
                  Upload your first spreadsheet to populate exam marks for your courses.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  const subjectScores = data?.subjectWise || [];
  const recentPerformance = data?.recentPerformance || [];
  const assignments = data?.assignments || [];

  const maxTrendScore =
    recentPerformance.reduce((max, item) => Math.max(max, item.percentage || 0), 0) || 100;
  const maxSubjectScore =
    subjectScores.reduce((max, item) => Math.max(max, item.score || 0), 0) || 100;

  return (
    <div className="results-page">
      {uploadModal}
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
