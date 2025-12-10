import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, AlertCircle, Upload, FileText, Download, User } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import axios from '../../lib/axios';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import './AssignmentsPage.css';

const CreateAssignmentModal = ({
  isOpen,
  onClose,
  payload,
  onFieldChange,
  onSubmit,
  courses,
  isCoursesLoading,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold">Create Assignment</h2>
          <button
            type="button"
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            onClick={onClose}
            aria-label="Close"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300" htmlFor="assignment-title">
              Title
            </label>
            <Input
              id="assignment-title"
              value={payload.title}
              onChange={(e) => onFieldChange('title', e.target.value)}
              placeholder="e.g. Lab Exercise: Array Operations"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300" htmlFor="assignment-description">
              What is this assignment about?
            </label>
            <Textarea
              id="assignment-description"
              rows={4}
              value={payload.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              placeholder="Implement various array operations including insertion, deletion, and searching."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300" htmlFor="assignment-course">
              Subject / Course
            </label>
            <select
              id="assignment-course"
              value={payload.course}
              onChange={(e) => onFieldChange('course', e.target.value)}
              className="input"
              disabled={isCoursesLoading || courses.length === 0 || isSubmitting}
            >
              <option value="" disabled>
                {isCoursesLoading ? 'Loading courses...' : 'Select a course'}
              </option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
            {!isCoursesLoading && courses.length === 0 && (
              <p className="text-xs text-slate-400">
                You don’t have any assigned courses yet. Please add a course before creating assignments.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300" htmlFor="assignment-dueDate">
                Due Date
              </label>
              <Input
                id="assignment-dueDate"
                type="datetime-local"
                value={payload.dueDate}
                onChange={(e) => onFieldChange('dueDate', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300" htmlFor="assignment-points">
                Points
              </label>
              <Input
                id="assignment-points"
                type="number"
                min={1}
                value={payload.points}
                onChange={(e) => onFieldChange('points', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting || courses.length === 0}>
            {isSubmitting ? 'Creating…' : 'Create Assignment'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const AssignmentSubmission = ({ assignment }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(`/assignments/${assignment._id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Assignment submitted successfully',
      });
      queryClient.invalidateQueries(['assignments']);
      setFile(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit assignment',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    submitMutation.mutate(formData);
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id={`file-upload-${assignment._id}`}
        />
        <label
          htmlFor={`file-upload-${assignment._id}`}
          className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline"
        >
          <Upload className="h-4 w-4" />
          {file ? file.name : 'Click to upload file'}
        </label>
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!file || submitMutation.isPending}
        className="assignment-submit-button w-full sm:w-auto"
      >
        {submitMutation.isPending ? (
          'Submitting...'
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit
          </>
        )}
      </Button>
    </div>
  );
};

const FacultyAssignmentView = ({ assignment, apiBaseUrl }) => {
  const [showSubmissions, setShowSubmissions] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [gradeInputs, setGradeInputs] = useState({});
  const [statusMessages, setStatusMessages] = useState({});
  const maxPoints = assignment.points || 100;

  const gradeMutation = useMutation({
    mutationFn: async ({ assignmentId, submissionId, grade, feedback }) => {
      const payload = {
        submissionId,
        grade,
        feedback,
      };
      const response = await axios.put(`/assignments/${assignmentId}/grade`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Grade saved',
        description: 'The submission has been graded successfully.',
      });
      setGradeInputs((prev) => ({
        ...prev,
        [variables.submissionId]: {
          grade: variables.grade !== undefined && variables.grade !== null ? String(variables.grade) : '',
          feedback: variables.feedback ?? '',
        },
      }));
      setStatusMessages((prev) => ({
        ...prev,
        [variables.submissionId]: {
          type: 'success',
          message: 'Grade updated successfully.',
        },
      }));
      queryClient.invalidateQueries(['assignments']);
    },
    onError: (error, variables) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save grade',
        variant: 'destructive',
      });
      if (variables?.submissionId) {
        setStatusMessages((prev) => ({
          ...prev,
          [variables.submissionId]: {
            type: 'error',
            message: error.response?.data?.message || 'Unable to save grade. Try again.',
          },
        }));
      }
    },
  });

  const handleGradeInputChange = (submissionId, field, value) => {
    setGradeInputs((prev) => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }));
  };

  const handleGradeSubmit = (submission) => {
    const inputState = gradeInputs[submission._id] || {};
    const gradeValue = inputState.grade !== undefined
      ? inputState.grade
      : submission.grade !== undefined && submission.grade !== null
        ? String(submission.grade)
        : '';
    const feedbackValue = inputState.feedback !== undefined ? inputState.feedback : submission.feedback ?? '';

    if (gradeValue === '') {
      toast({
        title: 'Enter a grade',
        description: 'Please provide a grade before saving.',
        variant: 'destructive',
      });
      return;
    }

    const numericGrade = Number(gradeValue);

    if (Number.isNaN(numericGrade)) {
      toast({
        title: 'Invalid grade',
        description: 'Grade must be a number.',
        variant: 'destructive',
      });
      return;
    }

    if (numericGrade < 0 || numericGrade > maxPoints) {
      toast({
        title: 'Grade out of range',
        description: `Grade must be between 0 and ${maxPoints}.`,
        variant: 'destructive',
      });
      return;
    }

    setStatusMessages((prev) => ({
      ...prev,
      [submission._id]: {
        type: 'info',
        message: 'Saving grade...',
      },
    }));

    gradeMutation.mutate({
      assignmentId: assignment._id,
      submissionId: submission._id,
      grade: numericGrade,
      feedback: feedbackValue,
    });
  };

  return (
    <Card className="assignment-card">
      <CardContent className="assignment-content">
        <div className="assignment-main">
          <div className="assignment-info w-full">
            <div className="flex justify-between items-start mb-2">
              <h3 className="assignment-title text-lg font-semibold">{assignment.title}</h3>
              <Badge variant="outline">{assignment.course?.code}</Badge>
            </div>
            <p className="assignment-description mb-4">{assignment.description || 'No description available'}</p>
            <div className="assignment-details grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-muted-foreground">
              <span className="assignment-detail-item">Subject: {assignment.course?.name || 'N/A'}</span>
              <span className="assignment-detail-item">Due: {format(new Date(assignment.dueDate), 'yyyy-MM-dd')}</span>
              <span className="assignment-detail-item">Points: {assignment.points || 100}</span>
              <span className="assignment-detail-item">Submissions: {assignment.submissions?.length || 0}</span>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowSubmissions(!showSubmissions)}
              className="w-full sm:w-auto"
            >
              {showSubmissions ? 'Hide Submissions' : 'View Submissions'}
            </Button>

            {showSubmissions && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold mb-2">Student Submissions</h4>
                {assignment.submissions?.length > 0 ? (
                  <div className="space-y-2">
                    {assignment.submissions.map((sub, index) => (
                      (() => {
                        const state = gradeInputs[sub._id] || {};
                        const displayedGrade = state.grade !== undefined
                          ? state.grade
                          : sub.grade !== undefined && sub.grade !== null
                            ? String(sub.grade)
                            : '';
                        const displayedFeedback = state.feedback !== undefined ? state.feedback : sub.feedback || '';
                        const status = statusMessages[sub._id];
                        const isSaving = gradeMutation.isPending && gradeMutation.variables?.submissionId === sub._id;

                        return (
                          <div key={index} className="faculty-submission-card">
                            <div className="faculty-submission-header">
                              <div className="faculty-submission-meta">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="faculty-submission-name">{sub.student?.name || 'Unknown Student'}</p>
                                  <p className="faculty-submission-email">{sub.student?.email || 'Email unavailable'}</p>
                                </div>
                              </div>
                              <div className="submission-timestamp">
                                <Clock className="h-4 w-4" />
                                <span>{format(new Date(sub.submittedAt), 'MMM d, h:mm a')}</span>
                              </div>
                            </div>

                            <div className="faculty-submission-body">
                              <div className="submission-badge-row">
                                <Badge variant={sub.grade ? 'success' : 'secondary'}>
                                  {sub.grade ? `Grade: ${sub.grade}` : 'Not Graded'}
                                </Badge>
                                <div className="submission-file-links">
                                  {Array.isArray(sub.files) && sub.files.length > 0 ? (
                                    sub.files.map((submittedFile, fileIndex) => (
                                      <Button
                                        key={fileIndex}
                                        variant="secondary"
                                        size="sm"
                                        className="submission-file-button"
                                        asChild
                                      >
                                        <a
                                          href={`${apiBaseUrl}/${submittedFile.fileUrl}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <FileText className="h-4 w-4 mr-1" />
                                          {submittedFile.fileName || 'View File'}
                                        </a>
                                      </Button>
                                    ))
                                  ) : (
                                    sub.file && (
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        className="submission-file-button"
                                        asChild
                                      >
                                        <a
                                          href={`${apiBaseUrl}/${sub.file}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <FileText className="h-4 w-4 mr-1" />
                                          View File
                                        </a>
                                      </Button>
                                    )
                                  )}
                                </div>
                              </div>

                              <div className="grade-panel">
                                <div className="grade-panel-header">
                                  <span>{sub.grade ? `Last saved grade: ${sub.grade}/${maxPoints}` : 'Awaiting grading'}</span>
                                  {sub.feedback && !displayedFeedback && (
                                    <span className="grade-panel-note">Previous feedback will be cleared.</span>
                                  )}
                                </div>

                                <div className="grade-fields">
                                  <label className="grade-field">
                                    <span className="grade-field-label">Grade</span>
                                    <div className="grade-input-wrapper">
                                      <input
                                        type="number"
                                        min="0"
                                        max={maxPoints}
                                        className="grade-input"
                                        value={displayedGrade}
                                        onChange={(e) => handleGradeInputChange(sub._id, 'grade', e.target.value)}
                                        placeholder="e.g. 85"
                                      />
                                      <span className="grade-input-max">/ {maxPoints}</span>
                                    </div>
                                  </label>

                                  <label className="grade-field grade-field--feedback">
                                    <span className="grade-field-label">Feedback</span>
                                    <textarea
                                      rows={2}
                                      className="grade-textarea"
                                      placeholder="Share constructive feedback with the student"
                                      value={displayedFeedback}
                                      onChange={(e) => handleGradeInputChange(sub._id, 'feedback', e.target.value)}
                                    />
                                  </label>
                                </div>

                                <div className="grade-actions">
                                  <Button
                                    size="sm"
                                    className="grade-save-button"
                                    onClick={() => handleGradeSubmit(sub)}
                                    disabled={isSaving}
                                  >
                                    {isSaving
                                      ? 'Saving...'
                                      : sub.grade !== undefined && sub.grade !== null
                                        ? 'Update Grade'
                                        : 'Save Grade'}
                                  </Button>
                                  {status && (
                                    <span
                                      className={`grade-status grade-status--${status.type}`}
                                      role="status"
                                    >
                                      {status.message}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">No submissions yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AssignmentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createPayload, setCreatePayload] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: '',
    points: 100,
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const canManageAssignments = isTeacher || isAdmin;
  const apiBaseUrl = useMemo(() => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
      return envUrl.replace(/\/?api\/v1$/, '');
    }
    return 'http://localhost:5000';
  }, []);

  const queryClient = useQueryClient();

  const { data: teacherCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['teacher-courses', user?._id || user?.id],
    queryFn: async () => {
      const { data } = await axios.get('/courses');
      const allCourses = data.data || [];
      if (!isTeacher) return allCourses;

      const teacherId = user?._id || user?.id;
      return allCourses.filter((course) => {
        if (!course.teacher) return false;
        const courseTeacher = typeof course.teacher === 'object' ? course.teacher._id : course.teacher;
        return courseTeacher === teacherId;
      });
    },
    enabled: canManageAssignments,
  });

  useEffect(() => {
    if (isTeacher && teacherCourses.length > 0 && !createPayload.course) {
      setCreatePayload((prev) => ({ ...prev, course: teacherCourses[0]._id }));
    }
  }, [isTeacher, teacherCourses, createPayload.course]);

  const createAssignmentMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await axios.post('/assignments', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      setIsCreateOpen(false);
      setCreatePayload({
        title: '',
        description: '',
        course: '',
        dueDate: '',
        points: 100,
      });
      toast({
        title: 'Assignment created',
        description: 'The new assignment is now visible to students.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create assignment',
        description: error.response?.data?.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/assignments');
        return data.data || [];
      } catch (error) {
        console.error('Error fetching assignments:', error);
        return [];
      }
    },
  });

  const handleCreateAssignment = () => {
    if (!isTeacher) return;

    const trimmedTitle = createPayload.title.trim();
    const trimmedDescription = createPayload.description.trim();

    if (!trimmedTitle) {
      toast({
        title: 'Title is required',
        description: 'Please provide a title for the assignment.',
        variant: 'destructive',
      });
      return;
    }

    if (!trimmedDescription) {
      toast({
        title: 'What is the assignment about?',
        description: 'Please add a brief description so students know the expectations.',
        variant: 'destructive',
      });
      return;
    }

    if (!createPayload.course) {
      toast({
        title: 'Select a course',
        description: 'Choose which course this assignment belongs to.',
        variant: 'destructive',
      });
      return;
    }

    if (!createPayload.dueDate) {
      toast({
        title: 'Due date needed',
        description: 'Please set a due date for the assignment.',
        variant: 'destructive',
      });
      return;
    }

    const numericPoints = Number(createPayload.points);
    if (!Number.isFinite(numericPoints) || numericPoints <= 0) {
      toast({
        title: 'Invalid points',
        description: 'Points must be a positive number.',
        variant: 'destructive',
      });
      return;
    }

    const dueDateISO = new Date(createPayload.dueDate);
    if (Number.isNaN(dueDateISO.getTime())) {
      toast({
        title: 'Invalid due date',
        description: 'Please choose a valid date and time.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      title: trimmedTitle,
      description: trimmedDescription,
      course: createPayload.course,
      dueDate: dueDateISO.toISOString(),
      points: numericPoints,
    };

    createAssignmentMutation.mutate(payload);
  };

  const filteredAssignments = assignments?.filter(
    (assignment) =>
      assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Check if assignment has been submitted by current user
  const checkSubmitted = (assignment) => {
    if (!assignment.submissions || !Array.isArray(assignment.submissions)) return false;
    return assignment.submissions.some(sub => sub.student?._id === user?._id || sub.student === user?._id);
  };

  const upcomingAssignments = filteredAssignments?.filter(
    (a) => isAfter(new Date(a.dueDate), new Date()) && !checkSubmitted(a)
  ) || [];

  const submittedAssignments = filteredAssignments?.filter((a) => checkSubmitted(a)) || [];

  const gradedAssignments = submittedAssignments?.filter((a) => {
    const submission = a.submissions?.find(sub => sub.student?._id === user?._id || sub.student === user?._id);
    return submission?.grade !== undefined && submission?.grade !== null;
  }) || [];

  const pendingAssignments = filteredAssignments?.filter(
    (a) => isAfter(new Date(a.dueDate), new Date()) && !checkSubmitted(a)
  ) || [];

  const pastDueAssignments = filteredAssignments?.filter(
    (a) => isBefore(new Date(a.dueDate), new Date()) && !checkSubmitted(a)
  ) || [];

  // Calculate average score
  const avgScore = gradedAssignments.length > 0
    ? Math.round(
      gradedAssignments.reduce((sum, a) => {
        const submission = a.submissions?.find(sub => sub.student?._id === user?._id || sub.student === user?._id);
        const grade = submission?.grade || 0;
        const points = a.points || 100;
        return sum + (grade / points) * 100;
      }, 0) / gradedAssignments.length
    )
    : 0;

  const createAssignmentModal = isTeacher ? (
    <CreateAssignmentModal
      isOpen={isCreateOpen}
      onClose={() => {
        setIsCreateOpen(false);
        setCreatePayload({
          title: '',
          description: '',
          course: teacherCourses[0]?._id || '',
          dueDate: '',
          points: 100,
        });
      }}
      payload={createPayload}
      onFieldChange={(field, value) => {
        setCreatePayload((prev) => ({
          ...prev,
          [field]: field === 'points' ? value : value,
        }));
      }}
      onSubmit={handleCreateAssignment}
      courses={teacherCourses}
      isCoursesLoading={coursesLoading}
      isSubmitting={createAssignmentMutation.isPending}
    />
  ) : null;

  if (isLoading) {
    return (
      <div className="assignments-page">
        <div className="loading-container">
          <div className="spinner" />
        </div>
        {createAssignmentModal}
      </div>
    );
  }

  if (canManageAssignments) {
    return (
      <div className="assignments-page">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="assignments-header"
        >
          <div>
            <h1 className="assignments-title">Assignment Management</h1>
            <p className="assignments-subtitle">View submissions and grade assignments</p>
          </div>
          {isTeacher && (
            <Button
              onClick={() => {
                setIsCreateOpen(true);
              }}
              disabled={coursesLoading || teacherCourses.length === 0}
            >
              Create Assignment
            </Button>
          )}
        </motion.div>

        {createAssignmentModal}

        <div className="space-y-4">
          <div className="flex gap-4 mb-6">
            <Card className="p-4 flex-1">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{assignments?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="assignments-list space-y-4">
            {filteredAssignments.map(assignment => (
              <FacultyAssignmentView key={assignment._id} assignment={assignment} apiBaseUrl={apiBaseUrl} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assignments-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="assignments-header"
      >
        <div>
          <h1 className="assignments-title">Assignments</h1>
          <p className="assignments-subtitle">View and submit your assignments</p>
        </div>
      </motion.div>

      <div className="assignments-stats">
        <Card className="assignment-stat-card">
          <CardContent className="assignment-stat-content">
            <Clock className="assignment-stat-icon" />
            <div className="assignment-stat-info">
              <p className="assignment-stat-value">{pendingAssignments.length}</p>
              <p className="assignment-stat-label">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="assignment-stat-card">
          <CardContent className="assignment-stat-content">
            <CheckCircle className="assignment-stat-icon" />
            <div className="assignment-stat-info">
              <p className="assignment-stat-value">{submittedAssignments.length}</p>
              <p className="assignment-stat-label">Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card className="assignment-stat-card">
          <CardContent className="assignment-stat-content">
            <CheckCircle className="assignment-stat-icon" />
            <div className="assignment-stat-info">
              <p className="assignment-stat-value">{gradedAssignments.length}</p>
              <p className="assignment-stat-label">Graded</p>
            </div>
          </CardContent>
        </Card>
        <Card className="assignment-stat-card">
          <CardContent className="assignment-stat-content">
            <CheckCircle className="assignment-stat-icon" />
            <div className="assignment-stat-info">
              <p className="assignment-stat-value">{avgScore}%</p>
              <p className="assignment-stat-label">Avg Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="assignments-tabs">
        <TabsList>
          <TabsTrigger value="upcoming" className="tab-trigger">
            <Clock className="h-4 w-4" /> Upcoming
            {upcomingAssignments?.length > 0 && (
              <Badge variant="secondary" className="tab-badge">
                {upcomingAssignments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="submitted" className="tab-trigger">
            <CheckCircle className="h-4 w-4" /> Submitted
            {submittedAssignments?.length > 0 && (
              <Badge variant="secondary" className="tab-badge">
                {submittedAssignments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past-due" className="tab-trigger">
            <AlertCircle className="h-4 w-4" /> Past Due
            {pastDueAssignments?.length > 0 && (
              <Badge variant="destructive" className="tab-badge">
                {pastDueAssignments.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="tab-content">
          {pendingAssignments?.length ? (
            <div className="assignments-list">
              {pendingAssignments.map((assignment) => (
                <Card key={assignment._id} className="assignment-card">
                  <CardContent className="assignment-content">
                    <div className="assignment-main">
                      <div className="assignment-status">
                        <Badge variant="destructive" className="assignment-status-badge">
                          <Clock className="h-3 w-3" style={{ marginRight: '0.25rem' }} />
                          Pending
                        </Badge>
                      </div>
                      <div className="assignment-info w-full">
                        <h3 className="assignment-title">{assignment.title}</h3>
                        <p className="assignment-description">{assignment.description || 'No description available'}</p>
                        <div className="assignment-details">
                          <span className="assignment-detail-item">Subject: {assignment.course?.name || 'N/A'}</span>
                          <span className="assignment-detail-item">Due: {format(new Date(assignment.dueDate), 'yyyy-MM-dd')}</span>
                          <span className="assignment-detail-item">Points: {assignment.points || 100}</span>
                        </div>
                        <AssignmentSubmission assignment={assignment} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="empty-content">
                <p className="empty-message">No upcoming assignments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="submitted" className="tab-content">
          {submittedAssignments?.length ? (
            <div className="assignments-list">
              {submittedAssignments.map((assignment) => {
                const submission = assignment.submissions?.find(sub => sub.student?._id === user?._id || sub.student === user?._id);
                const isGraded = submission?.grade !== undefined && submission?.grade !== null;
                return (
                  <Card key={assignment._id} className="assignment-card">
                    <CardContent className="assignment-content">
                      <div className="assignment-main">
                        <div className="assignment-status">
                          <Badge
                            variant={isGraded ? "default" : "secondary"}
                            className="assignment-status-badge"
                          >
                            {isGraded ? (
                              <>
                                <CheckCircle className="h-3 w-3" style={{ marginRight: '0.25rem' }} />
                                Graded
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3" style={{ marginRight: '0.25rem' }} />
                                Submitted
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className="assignment-info">
                          <h3 className="assignment-title">{assignment.title}</h3>
                          <p className="assignment-description">{assignment.description || 'No description available'}</p>
                          <div className="assignment-details">
                            <span className="assignment-detail-item">Subject: {assignment.course?.name || 'N/A'}</span>
                            <span className="assignment-detail-item">Due: {format(new Date(assignment.dueDate), 'yyyy-MM-dd')}</span>
                            <span className="assignment-detail-item">Points: {assignment.points || 100}</span>
                            {isGraded && (
                              <span className="assignment-detail-item">
                                Grade: {submission.grade}/{assignment.points || 100}
                              </span>
                            )}
                            {Array.isArray(submission?.files) && submission.files.length > 0 ? (
                              submission.files.map((submittedFile, fileIndex) => (
                                <span key={fileIndex} className="assignment-detail-item">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="submission-file-button"
                                    asChild
                                  >
                                    <a
                                      href={`${apiBaseUrl}/${submittedFile.fileUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <FileText className="h-4 w-4" />
                                      {submittedFile.fileName || 'View Submission'}
                                    </a>
                                  </Button>
                                </span>
                              ))
                            ) : (
                              submission?.file && (
                                <span className="assignment-detail-item">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="submission-file-button"
                                    asChild
                                  >
                                    <a
                                      href={`${apiBaseUrl}/${submission.file}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <FileText className="h-4 w-4" /> View Submission
                                    </a>
                                  </Button>
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="empty-content">
                <p className="empty-message">No submitted assignments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past-due" className="tab-content">
          {pastDueAssignments?.length ? (
            <div className="assignments-list">
              {pastDueAssignments.map((assignment) => (
                <Card key={assignment._id}>
                  <CardContent className="assignment-content">
                    <div className="assignment-info">
                      <h3 className="assignment-title">{assignment.title}</h3>
                      <p className="assignment-meta">{assignment.course?.name}</p>
                    </div>
                    <Badge variant="destructive">Past Due</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="empty-content">
                <p className="empty-message">No past due assignments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

