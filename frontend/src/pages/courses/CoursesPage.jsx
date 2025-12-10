import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';
import axios from '../../lib/axios';
import { motion } from 'framer-motion';
import './CoursesPage.css';

export const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await axios.get('/courses');
      return data.data;
    },
  });

  const filteredCourses = courses?.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="courses-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="courses-header"
      >
        <div>
          <h1 className="courses-title">My Courses</h1>
          <p className="courses-subtitle">View and manage all your enrolled courses</p>
        </div>
      </motion.div>

      <div className="courses-search">
        <Search className="search-icon" />
        <Input
          placeholder="Search courses..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="courses-grid">
        {filteredCourses?.map((course, index) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={`/courses/${course._id}`} className="course-link">
              <Card className="course-card">
                <CardHeader>
                  <div className="course-header">
                    <CardTitle className="course-name">{course.name}</CardTitle>
                    <Badge variant="outline">{course.code}</Badge>
                  </div>
                  <CardDescription>{course.teacher?.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="course-description">{course.description}</p>
                </CardContent>
                <CardFooter className="course-footer">
                  <span>{course.students?.length || 0} students</span>
                  <span>Enrolled on {format(new Date(course.createdAt), 'MMM d, yyyy')}</span>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        ))}

        {filteredCourses?.length === 0 && (
          <div className="courses-empty">
            <div className="empty-content">
              {searchTerm ? (
                <>
                  <p>No courses found matching "{searchTerm}"</p>
                  <Button variant="ghost" className="mt-2" onClick={() => setSearchTerm('')}>
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <p>You're not enrolled in any courses yet.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

