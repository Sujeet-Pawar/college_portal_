const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketio = require('socket.io');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://pawarshrimanta_db_user:clgapp123@miniclgapp.9t3qnlm.mongodb.net/college-portal?retryWrites=true&w=majority';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/courses', require('./routes/courseRoutes'));
app.use('/api/v1/assignments', require('./routes/assignmentRoutes'));
app.use('/api/v1/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/v1/timetable', require('./routes/timetableRoutes'));
app.use('/api/v1/attendance', require('./routes/attendanceRoutes'));
app.use('/api/v1/notes', require('./routes/notesRoutes'));
app.use('/api/v1/bus-tracking', require('./routes/busRoutes'));
app.use('/api/v1/results', require('./routes/resultsRoutes'));
app.use('/api/v1/achievements', require('./routes/achievementsRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('College Portal API is running...');
});

// Error handling middleware (must be after routes)
app.use(require('./middleware/error'));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
