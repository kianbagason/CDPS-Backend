const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Student = require('../models/Student');

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample data
const firstNames = ['Juan', 'Maria', 'Jose', 'Ana', 'Carlos', 'Rosa', 'Miguel', 'Carmen', 'Pedro', 'Sofia',
  'Andres', 'Isabella', 'Diego', 'Valentina', 'Luis', 'Camila', 'Jorge', 'Lucia', 'Rafael', 'Elena',
  'Fernando', 'Patricia', 'Ricardo', 'Gabriela', 'Manuel', 'Alejandra', 'Francisco', 'Daniela', 'Antonio', 'Mariana'];

const lastNames = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Gonzalez',
  'Hernandez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Morales', 'Vasquez',
  'Castillo', 'Jimenez', 'Ruiz', 'Mendoza', 'Ortiz', 'Ramos', 'Alvarez', 'Moreno', 'Castro', 'Vargas'];

const courses = ['BSIT', 'BSCS'];
const sections = ['A', 'B', 'C', 'D'];
const genders = ['Male', 'Female'];

// Helper functions
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateEmail = (firstName, lastName, index) => {
  const domains = ['@gmail.com', '@yahoo.com', '@outlook.com'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}${randomItem(domains)}`;
};

const generateStudentNumber = async () => {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
  return currentYear + randomDigits;
};

async function generateStudents(count = 1000) {
  console.log(`Starting to generate ${count} student records...`);
  
  const createdStudents = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const firstName = randomItem(firstNames);
      const lastName = randomItem(lastNames);
      const email = generateEmail(firstName, lastName, i);
      const studentNumber = await generateStudentNumber();
      const course = randomItem(courses);
      const yearLevel = randomInt(1, 4);
      const section = randomItem(sections);
      const gender = randomItem(genders);
      
      // Create user account
      const user = await User.create({
        username: email,
        password: 'student123', // Default password
        role: 'student'
      });
      
      // Create student profile
      const student = await Student.create({
        firstName,
        lastName,
        middleName: randomItem(['', '', '', 'Delos', 'De', 'San', 'M']),
        suffix: randomItem(['', '', '', 'Jr.', 'Sr.', 'III']),
        email,
        phone: `09${randomInt(10, 99)}${randomInt(100, 999)}${randomInt(1000, 9999)}`,
        dateOfBirth: new Date(2000 - randomInt(18, 25), randomInt(0, 11), randomInt(1, 28)),
        gender,
        address: `${randomInt(1, 999)} ${randomItem(['Rizal', 'Mabini', 'Bonifacio', 'Aguinaldo', 'Del Pilar'])} St., ${randomItem(['Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig'])}`,
        emergencyContact: {
          name: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
          relationship: randomItem(['Parent', 'Guardian', 'Sibling']),
          phone: `09${randomInt(10, 99)}${randomInt(100, 999)}${randomInt(1000, 9999)}`
        },
        studentNumber,
        course,
        yearLevel,
        section,
        enrollmentYear: randomInt(2020, 2024),
        status: randomItem(['active', 'active', 'active', 'active', 'graduated', 'dropped']),
        userId: user._id
      });
      
      createdStudents.push(student._id);
      
      if ((i + 1) % 100 === 0) {
        console.log(`Created ${i + 1} students...`);
      }
    } catch (error) {
      console.error(`Error creating student ${i}:`, error.message);
    }
  }
  
  console.log(`\n✅ Successfully created ${createdStudents.length} student records!`);
  console.log('Default password for all students: student123');
  console.log('\nSample student numbers:');
  
  // Show some sample students
  const samples = await Student.find().limit(5).select('studentNumber firstName lastName course yearLevel section email');
  samples.forEach(s => {
    console.log(`${s.studentNumber} - ${s.firstName} ${s.lastName} | ${s.course}-${s.yearLevel}${s.section} | ${s.email}`);
  });
  
  mongoose.connection.close();
}

// Run the generator
const count = process.argv[2] ? parseInt(process.argv[2]) : 1000;
generateStudents(count);
