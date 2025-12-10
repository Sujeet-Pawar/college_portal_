import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../components/ui/use-toast';
import axios from '../../lib/axios';
import './AttendancePage.css';

export const StudentAttendanceView = () => {
    const { toast } = useToast();

    const { data: attendanceData, isLoading } = useQuery({
        queryKey: ['attendance'],
        queryFn: async () => {
            try {
                const { data } = await axios.get('/attendance');
                return data.data;
            } catch (error) {
                console.error('Error fetching attendance:', error);
                return {
                    overall: 0,
                    subjectWise: [],
                    records: []
                };
            }
        },
    });

    if (isLoading) {
        return (
            <div className="attendance-page">
                <div className="loading-container">
                    <div className="spinner" />
                </div>
            </div>
        );
    }

    // Sample monthly data for chart
    const monthlyData = [
        { month: 'Jan', percentage: 82 },
        { month: 'Feb', percentage: 85 },
        { month: 'Mar', percentage: 87 },
        { month: 'Apr', percentage: 89 },
    ];

    return (
        <div className="attendance-page">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="attendance-header"
            >
                <div>
                    <h1 className="attendance-title">Attendance</h1>
                    <p className="attendance-subtitle">Track your class attendance</p>
                </div>
            </motion.div>

            <div className="attendance-stats">
                <Card className="attendance-stat-card">
                    <CardContent className="attendance-stat-content">
                        <div className="attendance-stat-icon">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <div className="attendance-stat-info">
                            <p className="attendance-stat-label">Overall Attendance</p>
                            <p className="attendance-stat-value">{attendanceData?.overall || 0}%</p>
                            <p className="attendance-stat-change">
                                <TrendingUp className="h-4 w-4" />
                                Track your progress
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="attendance-grid">
                <Card className="attendance-chart-card">
                    <CardHeader>
                        <CardTitle>Monthly Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="attendance-chart">
                            {monthlyData.map((item, index) => (
                                <div key={item.month} className="attendance-chart-bar">
                                    <div
                                        className="attendance-chart-fill"
                                        style={{ height: `${item.percentage}%` }}
                                    />
                                    <p className="attendance-chart-label">{item.month}</p>
                                    <p className="attendance-chart-value">{item.percentage}%</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="attendance-subjects-card">
                    <CardHeader>
                        <CardTitle>Subject-wise Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="attendance-subjects-list">
                            {(attendanceData?.subjectWise || []).map((subject) => (
                                <div key={subject.name} className="attendance-subject-item">
                                    <div className="attendance-subject-info">
                                        <p className="attendance-subject-name">{subject.name}</p>
                                        <p className="attendance-subject-count">
                                            {subject.present}/{subject.total} classes
                                        </p>
                                    </div>
                                    <div className="attendance-subject-progress">
                                        <div className="attendance-progress-bar">
                                            <div
                                                className="attendance-progress-fill"
                                                style={{ width: `${subject.percentage || 0}%` }}
                                            />
                                        </div>
                                        <p className="attendance-subject-percentage">{(subject.percentage || 0).toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                            {(!attendanceData?.subjectWise || attendanceData.subjectWise.length === 0) && (
                                <p className="empty-message">No attendance records found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Attendance Records Table */}
            <Card style={{ marginTop: '1.5rem' }}>
                <CardHeader>
                    <CardTitle>Detailed Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="students-list">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData?.records?.map((record) => (
                                    <tr key={record._id}>
                                        <td>{new Date(record.date).toLocaleDateString()}</td>
                                        <td>{record.course.name} ({record.course.code})</td>
                                        <td>
                                            <span className={`status-badge ${record.status}`}>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!attendanceData?.records || attendanceData.records.length === 0) && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No attendance records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
