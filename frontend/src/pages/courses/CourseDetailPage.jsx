import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../context/AuthContext';
import axios from '../../lib/axios';
import './CourseDetailPage.css';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data } = await axios.get(`/courses/${id}`);
      return data.data;
    },
  });

  if (isLoading) {
    return <div>Loading course details...</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="course-detail-page">
      <div className="course-detail-header">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="course-detail-title">{course.name}</h1>
          <p className="course-detail-code">{course.code}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="course-tabs">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="course-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{course.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {course.assignments?.length ? (
                <div className="assignments-list">
                  {course.assignments.map((assignment) => (
                    <div key={assignment._id} className="assignment-item">
                      <div>
                        <h3 className="assignment-title">{assignment.title}</h3>
                        <p className="assignment-due-date">
                          Due {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/assignments/${assignment._id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No assignments yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Course Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {course.resources?.length ? (
                <div className="resources-list">
                  {course.resources.map((resource) => (
                    <div key={resource._id} className="resource-item">
                      <div>
                        <h3 className="resource-title">{resource.title}</h3>
                        <p className="resource-description">{resource.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No resources added yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

