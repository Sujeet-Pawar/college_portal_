# Database Setup Instructions

## Step 1: Update Environment Variables

Create or update your `backend/.env` file with the MongoDB connection string:

```env
MONGO_URI=mongodb+srv://pawarshrimanta_db_user:clgapp123@miniclgapp.9t3qnlm.mongodb.net/college-portal?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## Step 2: Seed the Database

Run the seed script to create the database schema and sample data:

```bash
cd backend
npm run seed
```

This will:
- Create the database `college-portal` in your MongoDB cluster
- Create collections: `users`, `courses`, `assignments`
- Add sample data including:
  - 1 Admin user
  - 2 Teacher users  
  - 3 Student users
  - 3 Courses with schedules
  - 3 Assignments

## Step 3: Verify Connection

Start your backend server:

```bash
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

## Database Schema

### Users Collection
- **Fields**: name, email, password (hashed), role, department, studentId, phone, avatar
- **Indexes**: email (unique), studentId (unique, sparse)

### Courses Collection  
- **Fields**: code, name, description, credits, teacher, students[], schedule[], resources[], assignments[]
- **Indexes**: code (unique)

### Assignments Collection
- **Fields**: title, description, course, teacher, dueDate, points, submissions[]
- **Indexes**: course + dueDate, submissions.student

## Sample Login Credentials

After seeding:

**Admin:**
- Email: `admin@college.edu`
- Password: `admin123`

**Teacher:**
- Email: `john.smith@college.edu`  
- Password: `teacher123`

**Student:**
- Email: `alice.williams@college.edu`
- Password: `student123`

## Notes

- The database name is `college-portal`
- All collections are created automatically when you first insert data
- The seed script will clear existing data before seeding
- Make sure your MongoDB Atlas cluster allows connections from your IP address

