# Quick Start Guide

## Step 1: Install Dependencies

From the root directory, run:
```bash
npm run install:all
```

This will install dependencies for:
- Root project (concurrently)
- Backend (Express, MongoDB, etc.)
- Frontend (React, Tailwind, etc.)

## Step 2: Set Up Environment Variables

### Backend (.env in `backend/` folder)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/college-portal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env in `frontend/` folder)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Step 3: Start MongoDB

Make sure MongoDB is running:
- **Windows**: Start MongoDB service or run `mongod`
- **Mac/Linux**: `sudo systemctl start mongod` or `brew services start mongodb-community`

## Step 4: Run the Application

From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend dev server on http://localhost:5173

## Step 5: Access the Application

1. Open http://localhost:5173 in your browser
2. Click "Sign up" to create a new account
3. Choose your role (Student or Teacher)
4. Fill in your details and register
5. You'll be automatically logged in and redirected to the dashboard

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check the MONGO_URI in backend/.env
- Try: `mongosh` to test MongoDB connection

### Port Already in Use
- Change PORT in backend/.env
- Or kill the process using the port

### Frontend Not Connecting to Backend
- Check VITE_API_URL in frontend/.env
- Ensure backend is running on the correct port
- Check CORS settings in backend/server.js

### Module Not Found Errors
- Run `npm run install:all` again
- Delete node_modules and reinstall
- Check Node.js version (should be v18+)

## Next Steps

1. Create test users (Student and Teacher accounts)
2. Create courses as a Teacher
3. Enroll in courses as a Student
4. Create assignments and test submissions
5. Explore all features!

