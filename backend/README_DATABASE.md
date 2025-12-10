# Database Setup Guide

## MongoDB Connection

The application is configured to connect to MongoDB Atlas cluster:
- **Connection String**: `mongodb+srv://pawarshrimanta_db_user:clgapp123@miniclgapp.9t3qnlm.mongodb.net/college-portal`

## Database Schema

The database contains the following collections:

### 1. Users Collection
- Stores user information (students, teachers, admins)
- Fields: name, email, password, role, department, studentId, phone, etc.

### 2. Courses Collection
- Stores course information
- Fields: code, name, description, credits, teacher, students, schedule, resources, assignments

### 3. Assignments Collection
- Stores assignment information
- Fields: title, description, course, teacher, dueDate, maxMarks, submissions

## Seeding the Database

To populate the database with sample data, run:

```bash
npm run seed
```

This will create:
- 1 Admin user
- 2 Teacher users
- 3 Student users
- 3 Courses
- 3 Assignments

## Sample Login Credentials

After seeding, you can use these credentials:

**Admin:**
- Email: `admin@college.edu`
- Password: `admin123`

**Teacher:**
- Email: `john.smith@college.edu`
- Password: `teacher123`

**Student:**
- Email: `alice.williams@college.edu`
- Password: `student123`

## Environment Variables

Make sure your `.env` file contains:

```env
MONGO_URI=mongodb+srv://pawarshrimanta_db_user:clgapp123@miniclgapp.9t3qnlm.mongodb.net/college-portal?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
PORT=5000
```

## Database Indexes

The following indexes are automatically created:

### Users Collection
- `email` - Unique index
- `studentId` - Unique sparse index

### Courses Collection
- `code` - Unique index
- Compound index on schedule (day, startTime, room)

### Assignments Collection
- Index on `course` and `dueDate`
- Index on `submissions.student`

