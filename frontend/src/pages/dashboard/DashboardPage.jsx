import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useQuery } from '@tanstack/react-query';
import axios from '../../lib/axios';
import { format } from 'date-fns';
import { BookOpen, Calendar, ClipboardList, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './DashboardPage.css';

export const DashboardPage = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await axios.get('/dashboard');
      return data.data;
    },
  });

  const role = user?.role;
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin';

  const stats = useMemo(() => {
    if (isStudent) {
      return [
        {
          title: 'Active Courses',
          value: dashboardData?.activeCourses ?? 0,
          icon: BookOpen,
          helper: 'Enrolled this semester',
        },
        {
          title: 'Upcoming Assignments',
          value: dashboardData?.upcomingAssignments ?? 0,
          icon: ClipboardList,
          helper: 'Due on or after today',
        },
        {
          title: "Today'" + 's Classes',
          value: dashboardData?.todaysClasses?.length ?? 0,
          icon: Calendar,
          helper: format(new Date(), 'EEEE'),
        },
        {
          title: 'Classmates',
          value: dashboardData?.classmates ?? 0,
          icon: Users,
          helper: 'Across your courses',
        },
      ];
    }

    const teacherStats = [
      {
        title: 'Courses Managed',
        value: dashboardData?.activeCourses ?? 0,
        icon: BookOpen,
        helper: 'Active in this term',
      },
      {
        title: isAdmin ? 'Total Students' : 'Students Reached',
        value: dashboardData?.totalStudents ?? 0,
        icon: Users,
        helper: isAdmin ? 'Across the institution' : 'Enrolled in your courses',
      },
      {
        title: 'Recent Assignments',
        value: dashboardData?.recentAssignments?.length ?? 0,
        icon: ClipboardList,
        helper: 'Last 5 created',
      },
    ];

    return teacherStats;
  }, [dashboardData, isAdmin, isStudent]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  const todaysClasses = dashboardData?.todaysClasses ?? [];
  const studentAssignments = dashboardData?.recentAssignments ?? [];
  const teacherCourses = dashboardData?.courses ?? [];
  const teacherAssignments = dashboardData?.recentAssignments ?? [];

  const safeFormatDate = (value) => {
    if (!value) {
      return 'N/A';
    }

    try {
      return format(new Date(value), 'MMM d, yyyy');
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="dashboard-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-header"
      >
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back! Here's your overview
          </p>
        </div>
        <div className="dashboard-date">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </motion.div>

      <div className="dashboard-stats">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="stat-card">
                <CardHeader className="stat-header">
                  <CardTitle className="stat-title">{stat.title}</CardTitle>
                  <Icon className="stat-icon" />
                </CardHeader>
                <CardContent>
                  <div className="stat-value">{stat.value}</div>
                  {stat.helper && <p className="stat-change">{stat.helper}</p>}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {isStudent ? (
        <div className="dashboard-grid">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="dashboard-schedule"
          >
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {todaysClasses.length === 0 ? (
                  <p className="empty-message">No scheduled classes today.</p>
                ) : (
                  <div className="schedule-list">
                    {todaysClasses.map((session) => (
                      <div key={session.course?.code || session._id} className="schedule-item">
                        <div className="schedule-details">
                          <p className="schedule-course">
                            {session.course?.code ? `${session.course.code} · ` : ''}
                            {session.course?.name}
                          </p>
                          <p className="schedule-time">
                            {session.startTime} – {session.endTime}
                          </p>
                          {session.room && <p className="schedule-time">Room {session.room}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="dashboard-assignments"
          >
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {studentAssignments.length === 0 ? (
                  <p className="empty-message">You&apos;re all caught up. No pending assignments!</p>
                ) : (
                  <div className="assignments-list">
                    {studentAssignments.map((assignment) => (
                      <div key={assignment._id} className="assignment-item">
                        <div>
                          <p className="assignment-title">{assignment.title}</p>
                          <p className="assignment-course">{assignment.course?.name}</p>
                        </div>
                        <p className="assignment-due">Due {safeFormatDate(assignment.dueDate)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <div className="dashboard-grid">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="dashboard-assignments"
          >
            <Card>
              <CardHeader>
                <CardTitle>{isAdmin ? 'All Courses' : 'Your Courses'}</CardTitle>
              </CardHeader>
              <CardContent>
                {teacherCourses.length === 0 ? (
                  <p className="empty-message">No active courses to display.</p>
                ) : (
                  <div className="assignments-list">
                    {teacherCourses.map((course) => (
                      <div key={course._id} className="assignment-item">
                        <div>
                          <p className="assignment-title">{course.name}</p>
                          <p className="assignment-course">{course.code}</p>
                        </div>
                        <p className="assignment-due">Created {safeFormatDate(course.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="dashboard-activities"
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {teacherAssignments.length === 0 ? (
                  <p className="empty-message">No assignments have been created yet.</p>
                ) : (
                  <div className="assignments-list">
                    {teacherAssignments.map((assignment) => (
                      <div key={assignment._id} className="assignment-item">
                        <div>
                          <p className="assignment-title">{assignment.title}</p>
                          <p className="assignment-course">{assignment.course?.name}</p>
                        </div>
                        <p className="assignment-due">Posted {safeFormatDate(assignment.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

