// Database seed script to create initial demo records and tokens for testing
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Class = require('../src/models/Class');
const Session = require('../src/models/Session');
const Quiz = require('../src/models/Quiz');
const generateToken = require('../src/utils/generateToken');

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI not found in environment');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // 1. Create or reuse Teacher (teacher@test.com / 123456)
    let teacher = await User.findOne({ email: 'teacher@test.com' });
    if (!teacher) {
      teacher = await User.create({
        name: 'Test Teacher',
        email: 'teacher@test.com',
        password: 'password123',
        role: 'teacher'
      });
      // Set to 123456 specifically
      teacher.password = '123456';
      await teacher.save();
    }

    // 2. Create or reuse Student (student@test.com / 123456)
    let student = await User.findOne({ email: 'student@test.com' });
    if (!student) {
      student = await User.create({
        name: 'Test Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student'
      });
      student.password = '123456';
      await student.save();
    }

    // 3. Create or reuse Class with student joined
    let classItem = await Class.findOne({ title: 'Physics 101', teacher: teacher._id });
    if (!classItem) {
      classItem = await Class.create({
        title: 'Physics 101',
        description: 'Introduction to Mechanics and Thermodynamics',
        subject: 'Physics',
        teacher: teacher._id,
        students: [student._id]
      });
    } else {
      const alreadyJoined = classItem.students.some(
        (id) => id.toString() === student._id.toString()
      );
      if (!alreadyJoined) {
        classItem.students.push(student._id);
        await classItem.save();
      }
    }

    // 4. Create or reuse Session with status 'live'
    let session = await Session.findOne({ class: classItem._id, title: 'Live Physics Lecture' });
    if (!session) {
      session = await Session.create({
        class: classItem._id,
        title: 'Live Physics Lecture',
        scheduledAt: new Date(),
        status: 'live',
        createdBy: teacher._id
      });
    } else if (session.status !== 'live') {
      session.status = 'live';
      await session.save();
    }

    // 5. Create or reuse Quiz with 3 questions
    let quiz = await Quiz.findOne({ class: classItem._id, title: 'Physics Basics Quiz' });
    if (!quiz) {
      quiz = await Quiz.create({
        title: 'Physics Basics Quiz',
        class: classItem._id,
        questions: [
          {
            questionText: 'What is the SI unit of force?',
            options: ['Joule', 'Newton', 'Watt', 'Pascal'],
            correctAnswer: 1
          },
          {
            questionText: 'What is the acceleration due to gravity on Earth (approx)?',
            options: ['9.8 m/s²', '8.9 m/s²', '10.8 m/s²', '7.8 m/s²'],
            correctAnswer: 0
          },
          {
            questionText: 'Which law states that for every action, there is an equal and opposite reaction?',
            options: [
              "Newton's First Law",
              "Newton's Second Law",
              "Newton's Third Law",
              'Law of Conservation of Energy'
            ],
            correctAnswer: 2
          }
        ],
        createdBy: teacher._id
      });
    }

    // 6. Generate JWT tokens for Teacher and Student
    const teacherToken = generateToken(teacher._id, teacher.role);
    const studentToken = generateToken(student._id, student.role);

    console.log('\n=============================================');
    console.log('ClassLive Seed Completed Successfully!');
    console.log('=============================================');
    console.log(`TEACHER_TOKEN: ${teacherToken}`);
    console.log(`STUDENT_TOKEN: ${studentToken}`);
    console.log(`CLASS_ID:      ${classItem._id}`);
    console.log(`SESSION_ID:    ${session._id}`);
    console.log(`QUIZ_ID:       ${quiz._id}`);
    console.log('=============================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedData();
