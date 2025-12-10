import { useAuth } from '../../context/AuthContext';
import { FacultyAttendanceView } from './FacultyAttendanceView';
import { StudentAttendanceView } from './StudentAttendanceView';

export const AttendancePage = () => {
  const { user } = useAuth();

  // Show faculty view for teachers and admins
  if (user?.role === 'teacher' || user?.role === 'admin') {
    return <FacultyAttendanceView />;
  }

  // Show student view for students
  return <StudentAttendanceView />;
};
