import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './providers/ThemeProvider';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CoursesPage } from './pages/courses/CoursesPage';
import { CourseDetailPage } from './pages/courses/CourseDetailPage';
import { AssignmentsPage } from './pages/assignments/AssignmentsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { TimetablePage } from './pages/timetable/TimetablePage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { NotesPage } from './pages/notes/NotesPage';
import { BusTrackingPage } from './pages/bus-tracking/BusTrackingPage';
import { ResultsPage } from './pages/results/ResultsPage';
import { AchievementsPage } from './pages/achievements/AchievementsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="college-portal-theme">
      <QueryProvider>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="timetable" element={<TimetablePage />} />
                  <Route path="attendance" element={<AttendancePage />} />
                  <Route path="notes" element={<NotesPage />} />
                  <Route path="bus-tracking" element={<BusTrackingPage />} />
                  <Route path="courses" element={<CoursesPage />} />
                  <Route path="courses/:id" element={<CourseDetailPage />} />
                  <Route path="assignments" element={<AssignmentsPage />} />
                  <Route path="results" element={<ResultsPage />} />
                  <Route path="achievements" element={<AchievementsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;

