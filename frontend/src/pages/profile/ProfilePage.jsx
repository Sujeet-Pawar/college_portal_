import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useToast } from '../../components/ui/use-toast';
import { Pencil, Save, X, Mail, Phone, MapPin, NotebookPen, GraduationCap, Users, CalendarCheck, BarChart3 } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from '../../lib/axios';
import './ProfilePage.css';

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        const digitsOnly = val.replace(/\D/g, '');
        return digitsOnly.length === 10;
      },
      { message: 'Phone number must be exactly 10 digits' }
    ),
  department: z
    .string()
    .min(2, 'Department must be at least 2 characters')
    .max(100, 'Department must not exceed 100 characters')
    .optional(),
});

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const isTeacher = user?.role === 'teacher';

  const { data: teacherCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['teacher-profile-courses'],
    queryFn: async () => {
      const { data } = await axios.get('/courses?teacher=me');
      return data.data || [];
    },
    enabled: isTeacher,
  });

  const teacherSummary = useMemo(() => {
    if (!isTeacher) return null;

    const courses = teacherCourses;
    const studentSet = new Set();
    let sessionCount = 0;

    courses.forEach((course) => {
      (course.students || []).forEach((student) => {
        if (student?._id) {
          studentSet.add(student._id);
        } else if (typeof student === 'string') {
          studentSet.add(student);
        }
      });
      sessionCount += course.schedule?.length ?? 0;
    });

    const coursesCount = courses.length;
    const studentsCount = studentSet.size;
    const upcomingSessions = sessionCount;
    const timetableLoad = coursesCount
      ? Math.min(100, Math.round((upcomingSessions / (coursesCount * 6)) * 100))
      : 0;

    return [
      {
        label: 'Courses Managed',
        value: coursesLoading ? '—' : coursesCount,
        icon: NotebookPen,
        hint: 'Active course schedules this term',
      },
      {
        label: 'Students Mentored',
        value: coursesLoading ? '—' : studentsCount,
        icon: Users,
        hint: 'Across all assigned courses',
      },
      {
        label: 'Upcoming Sessions',
        value: coursesLoading ? '—' : upcomingSessions,
        icon: CalendarCheck,
        hint: 'Classes or labs in the next 7 days',
      },
      {
        label: 'Timetable Utilization',
        value: coursesLoading ? '—' : `${timetableLoad}%`,
        icon: BarChart3,
        hint: 'Percentage of scheduled teaching slots filled',
      },
    ];
  }, [isTeacher, teacherCourses, coursesLoading]);

  const assignedCoursesDisplay = useMemo(() => {
    if (!isTeacher) return null;
    if (coursesLoading) return 'Loading...';
    if (!teacherCourses.length) return 'No assigned courses';
    return teacherCourses
      .map((course) => course.name || course.code || 'Untitled Course')
      .join(', ');
  }, [isTeacher, teacherCourses, coursesLoading]);

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="profile-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="profile-header"
      >
        <div>
          <h1 className="profile-title">Profile</h1>
          <p className="profile-subtitle">Manage your personal information</p>
        </div>
        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          <Pencil className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
          Edit Profile
        </Button>
      </motion.div>

      {isTeacher && teacherSummary && (
        <div className="profile-stats">
          {teacherSummary.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="profile-stat-card">
                  <CardContent className="profile-stat-content">
                    <Icon className="profile-stat-icon" />
                    <div className="profile-stat-info">
                      <p className="profile-stat-value">{stat.value}</p>
                      <p className="profile-stat-label">{stat.label}</p>
                      <span className="profile-stat-hint">{stat.hint}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="profile-main">
        <div className="profile-left">
          <Card className="profile-avatar-card">
            <CardContent className="profile-avatar-content">
              <Avatar className="profile-avatar-large">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <h2 className="profile-name">{user?.name || 'User'}</h2>
              <p className="profile-role-tag">{isTeacher ? 'Faculty Member' : user?.role}</p>
              <div className="profile-department-tag">
                {isTeacher ? `Department of ${user?.department || 'Not specified'}` : user?.department || 'Not specified'}
              </div>
            </CardContent>
          </Card>

          <Card className="profile-contact-card">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="profile-contact-content">
              <div className="profile-contact-item">
                <Mail className="profile-contact-icon" />
                <span>{user?.email || 'Not provided'}</span>
              </div>
              <div className="profile-contact-item">
                <Phone className="profile-contact-icon" />
                <span>{user?.phone || 'Not provided'}</span>
              </div>
              <div className="profile-contact-item">
                <MapPin className="profile-contact-icon" />
                <span>{isTeacher ? 'Faculty Office, Main Campus' : 'Belgaum, Karnataka, India'}</span>
              </div>
              {isTeacher && (
                <div className="profile-contact-item">
                  <GraduationCap className="profile-contact-icon" />
                  <span>Experience: {user?.experienceYears ?? 6} years</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="profile-right">
          <Card className="profile-info-card">
            <CardHeader>
              <CardTitle>{isTeacher ? 'Faculty Profile' : 'Personal Information'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="profile-form">
                  <div className="profile-info-grid">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="profile-info-item">
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} />
                            ) : (
                              <p className="profile-info-value">{user?.name || 'Not provided'}</p>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="profile-info-item">
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input
                                {...field}
                                type="tel"
                                placeholder="9876543210"
                                maxLength={10}
                                onKeyPress={(e) => {
                                  // Allow only numbers
                                  const allowedChars = /[0-9]/;
                                  if (!allowedChars.test(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            ) : (
                              <p className="profile-info-value">{user?.phone || 'Not provided'}</p>
                            )}
                          </FormControl>
                          {isEditing && (
                            <FormDescription>
                              Exactly 10 digits (optional) - Numbers only
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="profile-info-item">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input type="email" {...field} />
                            ) : (
                              <p className="profile-info-value">{user?.email || 'Not provided'}</p>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {isTeacher && (
                      <div className="profile-info-item">
                        <FormLabel>Office Hours</FormLabel>
                        <p className="profile-info-value">{user?.officeHours || 'Mon & Wed, 2:00 – 4:00 PM'}</p>
                      </div>
                    )}
                    <div className="profile-info-item">
                      <Label>Joined</Label>
                      <p className="profile-info-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="profile-form-actions">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="profile-card-header">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            ) : (
              <div className="profile-actions">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="profile-form">
              <div className="profile-form-content">
                <Avatar className="profile-avatar">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="profile-form-fields">
                  <div className="profile-form-grid">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} />
                            ) : (
                              <p className="profile-field-value">{user?.name}</p>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input type="email" {...field} />
                            ) : (
                              <p className="profile-field-value">{user?.email}</p>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input
                                {...field}
                                type="tel"
                                placeholder="9876543210"
                                maxLength={10}
                                onKeyPress={(e) => {
                                  // Allow only numbers
                                  const allowedChars = /[0-9]/;
                                  if (!allowedChars.test(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            ) : (
                              <p className="profile-field-value">{user?.phone || 'Not provided'}</p>
                            )}
                          </FormControl>
                          {isEditing && (
                            <FormDescription>
                              Exactly 10 digits (optional) - Numbers only
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="profile-field">
                      <Label>Role</Label>
                      <p className="profile-field-value capitalize">{isTeacher ? 'Teacher' : user?.role}</p>
                    </div>
                    {isTeacher && (
                      <div className="profile-field">
                        <Label>Assigned Courses</Label>
                        <p className="profile-field-value">{assignedCoursesDisplay}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

