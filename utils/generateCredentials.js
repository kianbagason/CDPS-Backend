const crypto = require('crypto');

// Generate username from student info
exports.generateUsername = (firstName, lastName, studentNumber) => {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  const last4Digits = studentNumber.slice(-4);
  
  return `${cleanFirst}.${cleanLast}${last4Digits}`;
};

// Generate random password
exports.generatePassword = (length = 10) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  
  // Ensure at least one uppercase, one lowercase, one number
  password += chars.charAt(Math.floor(Math.random() * 26)); // lowercase
  password += chars.charAt(Math.floor(Math.random() * 26) + 26); // uppercase
  password += chars.charAt(Math.floor(Math.random() * 10) + 52); // number
  
  // Fill rest with random chars
  for (let i = 3; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Generate faculty username
exports.generateFacultyUsername = (firstName, lastName, facultyId) => {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  
  return `faculty.${cleanFirst}.${cleanLast}`;
};
