import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Calendar, Download, Save, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import axios from '../../lib/axios';
import './AttendancePage.css';
import { useAuth } from '../../context/AuthContext';

export const FacultyAttendanceView = () => {
    const { user } = useAuth();
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch courses taught by faculty
    const { data: courses } = useQuery({
        queryKey: ['faculty-courses'],
        queryFn: async () => {
            const { data } = await axios.get('/courses');
            const allCourses = data.data || [];

            // Filter to show only courses taught by current user
            // Handle both populated teacher object and ID string cases
            return allCourses.filter(course => {
                if (!course.teacher) return false;
                const teacherId = typeof course.teacher === 'object' ? course.teacher._id : course.teacher;
                return teacherId === user?._id || teacherId === user?.id;
            });
        },
        enabled: !!user,
    });

    // Fetch course attendance for selected date
    const { data: courseAttendance, refetch } = useQuery({
        queryKey: ['course-attendance', selectedCourse, selectedDate],
        queryFn: async () => {
            if (!selectedCourse) return null;
            const { data } = await axios.get(`/attendance/course/${selectedCourse}?date=${selectedDate}`);
            return data.data;
        },
        enabled: !!selectedCourse,
    });

    // Mark attendance mutation
    const markAttendanceMutation = useMutation({
        mutationFn: async (data) => {
            const response = await axios.post('/attendance/mark-bulk', data);
            return response.data;
        },
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Attendance marked successfully',
            });
            queryClient.invalidateQueries(['course-attendance']);
            refetch();
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to mark attendance',
                variant: 'destructive',
            });
        },
    });

    // Download Excel
    const handleDownloadExcel = async () => {
        try {
            const response = await axios.get('/attendance/export/faculty', {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast({
                title: 'Success',
                description: 'Attendance report downloaded successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to download attendance report',
                variant: 'destructive',
            });
        }
    };

    // Handle attendance change
    const handleAttendanceChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status,
        }));
    };

    // Mark all present
    const markAllPresent = () => {
        if (!courseAttendance?.course?.students) return;
        const newData = {};
        courseAttendance.course.students.forEach(student => {
            newData[student._id] = 'present';
        });
        setAttendanceData(newData);
    };

    // Mark all absent
    const markAllAbsent = () => {
        if (!courseAttendance?.course?.students) return;
        const newData = {};
        courseAttendance.course.students.forEach(student => {
            newData[student._id] = 'absent';
        });
        setAttendanceData(newData);
    };

    // Save attendance
    const handleSaveAttendance = () => {
        const attendanceArray = Object.entries(attendanceData).map(([studentId, status]) => ({
            studentId,
            status,
        }));

        if (attendanceArray.length === 0) {
            toast({
                title: 'Warning',
                description: 'Please mark attendance for at least one student',
                variant: 'destructive',
            });
            return;
        }

        markAttendanceMutation.mutate({
            courseId: selectedCourse,
            date: selectedDate,
            attendanceData: attendanceArray,
        });
    };

    // Get current status for student
    const getStudentStatus = (studentId) => {
        if (attendanceData[studentId]) {
            return attendanceData[studentId];
        }

        // Check if already marked in database
        const existing = courseAttendance?.attendance?.find(a => a.student._id === studentId);
        return existing?.status || null;
    };

    return (
        <div className="faculty-attendance-page">
            <div className="attendance-header">
                <div>
                    <h1 className="attendance-title">Mark Attendance</h1>
                    <p className="attendance-subtitle">Mark attendance for your courses</p>
                </div>
                <Button onClick={handleDownloadExcel} variant="outline">
                    <Download className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                    Download Report
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Course and Date</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="attendance-filters">
                        <div className="filter-group">
                            <Label>Course</Label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="attendance-select"
                            >
                                <option value="">Select a course</option>
                                {courses?.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.code} - {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <Label>Date</Label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="attendance-date-input"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedCourse && courseAttendance && (
                <Card style={{ marginTop: '1.5rem' }}>
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>
                                {courseAttendance.course.name} - {new Date(selectedDate).toLocaleDateString()}
                            </CardTitle>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button onClick={markAllPresent} variant="outline" size="sm">
                                    <CheckCircle className="h-4 w-4" style={{ marginRight: '0.25rem' }} />
                                    All Present
                                </Button>
                                <Button onClick={markAllAbsent} variant="outline" size="sm">
                                    <XCircle className="h-4 w-4" style={{ marginRight: '0.25rem' }} />
                                    All Absent
                                </Button>
                                <Button onClick={handleSaveAttendance} disabled={markAttendanceMutation.isPending}>
                                    <Save className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                                    {markAttendanceMutation.isPending ? 'Saving...' : 'Save Attendance'}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="students-list">
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>USN</th>
                                        <th>Student Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courseAttendance.course.students.map((student) => {
                                        const currentStatus = getStudentStatus(student._id);
                                        return (
                                            <tr key={student._id}>
                                                <td>{student.studentId || 'N/A'}</td>
                                                <td>{student.name}</td>
                                                <td>{student.email}</td>
                                                <td>
                                                    <div className="attendance-buttons">
                                                        <button
                                                            className={`attendance-btn ${currentStatus === 'present' ? 'active present' : ''}`}
                                                            onClick={() => handleAttendanceChange(student._id, 'present')}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Present
                                                        </button>
                                                        <button
                                                            className={`attendance-btn ${currentStatus === 'absent' ? 'active absent' : ''}`}
                                                            onClick={() => handleAttendanceChange(student._id, 'absent')}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            Absent
                                                        </button>
                                                        <button
                                                            className={`attendance-btn ${currentStatus === 'late' ? 'active late' : ''}`}
                                                            onClick={() => handleAttendanceChange(student._id, 'late')}
                                                        >
                                                            <Clock className="h-4 w-4" />
                                                            Late
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {selectedCourse && !courseAttendance && (
                <Card style={{ marginTop: '1.5rem' }}>
                    <CardContent style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Loading course data...</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
