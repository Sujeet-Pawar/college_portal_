const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Timetable = require('../models/Timetable');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Assignment.deleteMany({});
    await Timetable.deleteMany({});
    console.log('Cleared existing data...');

    // Create Admin User (password will be hashed by User model pre-save hook)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      phone: '+1234567890',
    });
    console.log('✓ Created Admin User');

    // Create Teacher Users
    const teacher1 = await User.create({
      name: 'Dr. John Smith',
      email: 'john.smith@college.edu',
      password: 'teacher123',
      role: 'teacher',
      department: 'Computer Science',
      phone: '+1234567891',
    });

    const teacher2 = await User.create({
      name: 'Prof. Sarah Johnson',
      email: 'sarah.johnson@college.edu',
      password: 'teacher123',
      role: 'teacher',
      department: 'Mathematics',
      phone: '+1234567892',
    });

    const teacher3 = await User.create({
      name: 'Dr. Priya Menon',
      email: 'priya.menon@college.edu',
      password: 'teacher123',
      role: 'teacher',
      department: 'Electronics',
      phone: '+1234567896',
    });

    const teacher4 = await User.create({
      name: 'Prof. Miguel Santos',
      email: 'miguel.santos@college.edu',
      password: 'teacher123',
      role: 'teacher',
      department: 'Humanities',
      phone: '+1234567897',
    });
    console.log('✓ Created Teacher Users');

    // Create Student Users
    const student1 = await User.create({
      name: 'Alice Williams',
      email: 'alice.williams@college.edu',
      password: 'student123',
      role: 'student',
      department: 'Computer Science',
      studentId: 'STU001',
      phone: '+1234567893',
    });

    const student2 = await User.create({
      name: 'Bob Brown',
      email: 'bob.brown@college.edu',
      password: 'student123',
      role: 'student',
      department: 'Computer Science',
      studentId: 'STU002',
      phone: '+1234567894',
    });

    const student3 = await User.create({
      name: 'Charlie Davis',
      email: 'charlie.davis@college.edu',
      password: 'student123',
      role: 'student',
      department: 'Mathematics',
      studentId: 'STU003',
      phone: '+1234567895',
    });

    const student4 = await User.create({
      name: 'Diana Patel',
      email: 'diana.patel@college.edu',
      password: 'student123',
      role: 'student',
      department: 'Electronics',
      studentId: 'STU004',
      phone: '+1234567898',
    });

    const student5 = await User.create({
      name: 'Ethan Clark',
      email: 'ethan.clark@college.edu',
      password: 'student123',
      role: 'student',
      department: 'Humanities',
      studentId: 'STU005',
      phone: '+1234567899',
    });
    console.log('✓ Created Student Users');

    // Create Courses
    const course1 = await Course.create({
      code: 'CS101',
      name: 'Introduction to Computer Science',
      description: 'Fundamental concepts of computer science including programming basics, algorithms, and data structures.',
      credits: 3,
      department: 'Computer Science',
      teacher: teacher1._id,
      students: [student1._id, student2._id],
      schedule: [
        {
          day: 'Monday',
          startTime: '09:00',
          endTime: '10:30',
          room: 'Room 101',
        },
        {
          day: 'Wednesday',
          startTime: '09:00',
          endTime: '10:30',
          room: 'Room 101',
        },
      ],
      resources: [
        {
          title: 'Course Syllabus',
          description: 'Complete course syllabus and schedule',
          fileUrl: '/resources/syllabus.pdf',
          fileType: 'pdf',
          uploadedBy: teacher1._id,
        },
      ],
    });

    const course2 = await Course.create({
      code: 'MATH201',
      name: 'Calculus I',
      description: 'Introduction to differential and integral calculus with applications.',
      credits: 4,
      department: 'Mathematics',
      teacher: teacher2._id,
      students: [student3._id, student4._id],
      schedule: [
        {
          day: 'Tuesday',
          startTime: '11:00',
          endTime: '12:30',
          room: 'Room 205',
        },
        {
          day: 'Thursday',
          startTime: '11:00',
          endTime: '12:30',
          room: 'Room 205',
        },
      ],
      resources: [
        {
          title: 'Textbook Chapter 1',
          description: 'Introduction to limits and derivatives',
          fileUrl: '/resources/chapter1.pdf',
          fileType: 'pdf',
          uploadedBy: teacher2._id,
        },
      ],
    });

    const course3 = await Course.create({
      code: 'CS201',
      name: 'Data Structures and Algorithms',
      description: 'Advanced data structures, algorithm design, and analysis techniques.',
      credits: 3,
      department: 'Computer Science',
      teacher: teacher1._id,
      students: [student1._id, student2._id, student4._id],
      schedule: [
        {
          day: 'Friday',
          startTime: '14:00',
          endTime: '15:30',
          room: 'Lab 301',
        },
      ],
    });
    const course4 = await Course.create({
      code: 'ECE210',
      name: 'Digital Electronics',
      description: 'Logic gates, combinational circuits, and flip-flops with hands-on labs.',
      credits: 3,
      department: 'Electronics',
      teacher: teacher3._id,
      students: [student2._id, student4._id],
      schedule: [
        {
          day: 'Monday',
          startTime: '13:00',
          endTime: '14:30',
          room: 'Lab 210',
        },
        {
          day: 'Wednesday',
          startTime: '13:00',
          endTime: '14:30',
          room: 'Lab 210',
        },
      ],
    });

    const course5 = await Course.create({
      code: 'ENG105',
      name: 'Technical Communication',
      description: 'Professional communication skills, reports, and presentations.',
      credits: 2,
      department: 'Humanities',
      teacher: teacher4._id,
      students: [student1._id, student3._id, student5._id],
      schedule: [
        {
          day: 'Thursday',
          startTime: '09:30',
          endTime: '11:00',
          room: 'Room 118',
        },
      ],
    });

    const course6 = await Course.create({
      code: 'CS301',
      name: 'Operating Systems',
      description: 'Process scheduling, memory management, and concurrency fundamentals.',
      credits: 4,
      department: 'Computer Science',
      teacher: teacher1._id,
      students: [student1._id, student2._id],
      schedule: [
        {
          day: 'Tuesday',
          startTime: '14:00',
          endTime: '15:30',
          room: 'Room 204',
        },
        {
          day: 'Thursday',
          startTime: '14:00',
          endTime: '15:30',
          room: 'Room 204',
        },
      ],
    });

    const course7 = await Course.create({
      code: 'STAT150',
      name: 'Discrete Mathematics',
      description: 'Logic, combinatorics, and graph theory for computing.',
      credits: 3,
      department: 'Mathematics',
      teacher: teacher2._id,
      students: [student2._id, student3._id, student4._id],
      schedule: [
        {
          day: 'Monday',
          startTime: '10:45',
          endTime: '12:15',
          room: 'Room 207',
        },
        {
          day: 'Wednesday',
          startTime: '10:45',
          endTime: '12:15',
          room: 'Room 207',
        },
      ],
    });

    const course8 = await Course.create({
      code: 'ECE260',
      name: 'Embedded Systems Lab',
      description: 'Microcontroller programming and interfacing with sensors/actuators.',
      credits: 2,
      department: 'Electronics',
      teacher: teacher3._id,
      students: [student2._id, student4._id],
      schedule: [
        {
          day: 'Friday',
          startTime: '09:30',
          endTime: '12:30',
          room: 'Lab 215',
        },
      ],
    });

    const course9 = await Course.create({
      code: 'ENG210',
      name: 'Creative Writing Workshop',
      description: 'Writing exercises, peer critique, and storytelling fundamentals.',
      credits: 2,
      department: 'Humanities',
      teacher: teacher4._id,
      students: [student3._id, student5._id],
      schedule: [
        {
          day: 'Wednesday',
          startTime: '15:00',
          endTime: '16:30',
          room: 'Room 122',
        },
      ],
    });
    console.log('✓ Created Courses');

    // Create Assignments
    const assignment1 = await Assignment.create({
      title: 'Programming Assignment 1: Hello World',
      description: 'Create a simple program that prints "Hello World" in your preferred programming language.',
      course: course1._id,
      teacher: teacher1._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      points: 100,
      submissions: [
        {
          student: student1._id,
          submittedAt: new Date(),
          files: [
            {
              fileName: 'hello_world.py',
              fileUrl: '/submissions/hello_world.py',
              fileType: 'python',
              fileSize: '1024',
            },
          ],
        },
      ],
    });

    const assignment2 = await Assignment.create({
      title: 'Midterm Exam: Calculus Basics',
      description: 'Complete the midterm exam covering limits, derivatives, and basic integration.',
      course: course2._id,
      teacher: teacher2._id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      points: 100,
      submissions: [
        {
          student: student3._id,
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          grade: 78,
          feedback: 'Good attempt, review integration by parts.',
          gradedAt: new Date(),
        },
      ],
    });

    const assignment3 = await Assignment.create({
      title: 'Lab Exercise: Array Operations',
      description: 'Implement various array operations including insertion, deletion, and searching.',
      course: course3._id,
      teacher: teacher1._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      points: 50,
      submissions: [
        {
          student: student1._id,
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          grade: 45,
          feedback: 'Efficient implementations, well done.',
          gradedAt: new Date(),
        },
        {
          student: student2._id,
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          grade: 38,
          feedback: 'Consider optimizing search operations.',
          gradedAt: new Date(),
        },
      ],
    });

    const assignment4 = await Assignment.create({
      title: 'Project Brief: Logic Analyzer',
      description: 'Design a simple logic analyzer and document test cases.',
      course: course4._id,
      teacher: teacher3._id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      points: 75,
      submissions: [
        {
          student: student4._id,
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          grade: 60,
          feedback: 'Nice diagrams; tighten timing analysis.',
          gradedAt: new Date(),
        },
      ],
    });

    const assignment5 = await Assignment.create({
      title: 'Presentation: Emerging Tech Trends',
      description: 'Prepare a 10-minute presentation with slides and Q&A.',
      course: course5._id,
      teacher: teacher4._id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      points: 40,
    });
    console.log('✓ Created Assignments');

    // Update courses with assignments
    course1.assignments.push(assignment1._id);
    await course1.save();

    course2.assignments.push(assignment2._id);
    await course2.save();

    course3.assignments.push(assignment3._id);
    await course3.save();

    course4.assignments.push(assignment4._id);
    await course4.save();

    course5.assignments.push(assignment5._id);
    await course5.save();

    // Create timetable entries for richer schedule demos
    const timetableEntries = [
      {
        course: course1._id,
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'Room 101',
        professor: teacher1._id,
      },
      {
        course: course1._id,
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'Room 101',
        professor: teacher1._id,
      },
      {
        course: course3._id,
        day: 'Friday',
        startTime: '14:00',
        endTime: '15:30',
        room: 'Lab 301',
        professor: teacher1._id,
      },
      {
        course: course2._id,
        day: 'Tuesday',
        startTime: '11:00',
        endTime: '12:30',
        room: 'Room 205',
        professor: teacher2._id,
      },
      {
        course: course2._id,
        day: 'Thursday',
        startTime: '11:00',
        endTime: '12:30',
        room: 'Room 205',
        professor: teacher2._id,
      },
      {
        course: course4._id,
        day: 'Wednesday',
        startTime: '13:00',
        endTime: '14:30',
        room: 'Lab 210',
        professor: teacher3._id,
      },
      {
        course: course5._id,
        day: 'Thursday',
        startTime: '09:30',
        endTime: '11:00',
        room: 'Room 118',
        professor: teacher4._id,
      },
      {
        course: course6._id,
        day: 'Tuesday',
        startTime: '14:00',
        endTime: '15:30',
        room: 'Room 204',
        professor: teacher1._id,
      },
      {
        course: course6._id,
        day: 'Thursday',
        startTime: '14:00',
        endTime: '15:30',
        room: 'Room 204',
        professor: teacher1._id,
      },
      {
        course: course7._id,
        day: 'Monday',
        startTime: '10:45',
        endTime: '12:15',
        room: 'Room 207',
        professor: teacher2._id,
      },
      {
        course: course7._id,
        day: 'Wednesday',
        startTime: '10:45',
        endTime: '12:15',
        room: 'Room 207',
        professor: teacher2._id,
      },
      {
        course: course8._id,
        day: 'Friday',
        startTime: '09:30',
        endTime: '12:30',
        room: 'Lab 215',
        professor: teacher3._id,
      },
      {
        course: course9._id,
        day: 'Wednesday',
        startTime: '15:00',
        endTime: '16:30',
        room: 'Room 122',
        professor: teacher4._id,
      },
    ];

    await Timetable.insertMany(timetableEntries);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@college.edu');
    console.log('  Password: admin123');
    console.log('\nTeachers:');
    console.log('  Email: john.smith@college.edu (CS)');
    console.log('  Email: sarah.johnson@college.edu (Mathematics)');
    console.log('  Email: priya.menon@college.edu (Electronics)');
    console.log('  Email: miguel.santos@college.edu (Humanities)');
    console.log('  Password: teacher123');
    console.log('\nStudents:');
    console.log('  Email: alice.williams@college.edu (CS)');
    console.log('  Email: bob.brown@college.edu (CS)');
    console.log('  Email: charlie.davis@college.edu (Math)');
    console.log('  Email: diana.patel@college.edu (Electronics)');
    console.log('  Email: ethan.clark@college.edu (Humanities)');
    console.log('  Password: student123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();

