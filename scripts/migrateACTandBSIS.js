const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Student = require('../models/Student');

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function migrateStudentsToBSIT() {
  try {
    console.log('🔍 Searching for students in ACT and BSIS programs...\n');

    // Find all students in ACT or BSIS
    const studentsToMigrate = await Student.find({
      course: { $in: ['ACT', 'BSIS'] }
    });

    console.log(`📊 Found ${studentsToMigrate.length} students to migrate:\n`);

    // Show breakdown
    const actCount = studentsToMigrate.filter(s => s.course === 'ACT').length;
    const bsisCount = studentsToMigrate.filter(s => s.course === 'BSIS').length;
    
    console.log(`  - ACT students: ${actCount}`);
    console.log(`  - BSIS students: ${bsisCount}\n`);

    if (studentsToMigrate.length === 0) {
      console.log('✅ No students need to be migrated. All students are already in BSIT or BSCS.');
      mongoose.connection.close();
      return;
    }

    // Show sample students
    console.log('📋 Sample students to be migrated:');
    studentsToMigrate.slice(0, 5).forEach(student => {
      console.log(`  ${student.studentNumber} - ${student.firstName} ${student.lastName} | ${student.course} → BSIT`);
    });
    if (studentsToMigrate.length > 5) {
      console.log(`  ... and ${studentsToMigrate.length - 5} more students\n`);
    }

    // Confirm migration
    console.log('\n⚠️  This will permanently update all ACT and BSIS students to BSIT.');
    console.log('⏳ Starting migration...\n');

    // Perform migration
    const result = await Student.updateMany(
      { course: { $in: ['ACT', 'BSIS'] } },
      { $set: { course: 'BSIT' } }
    );

    console.log('✅ Migration completed successfully!\n');
    console.log('📈 Migration Summary:');
    console.log(`  - Total students migrated: ${result.modifiedCount}`);
    console.log(`  - Matched records: ${result.matchedCount}`);
    console.log(`  - All ACT and BSIS students are now enrolled in BSIT\n`);

    // Verify migration
    const remainingACT = await Student.countDocuments({ course: 'ACT' });
    const remainingBSIS = await Student.countDocuments({ course: 'BSIS' });
    const totalBSIT = await Student.countDocuments({ course: 'BSIT' });
    const totalBSCS = await Student.countDocuments({ course: 'BSCS' });

    console.log('📊 Current Distribution:');
    console.log(`  - BSIT: ${totalBSIT} students`);
    console.log(`  - BSCS: ${totalBSCS} students`);
    console.log(`  - ACT: ${remainingACT} students (should be 0)`);
    console.log(`  - BSIS: ${remainingBSIS} students (should be 0)\n`);

    if (remainingACT === 0 && remainingBSIS === 0) {
      console.log('✅ Verification passed! All students successfully migrated to BSIT or BSCS.');
    } else {
      console.log('⚠️  Warning: Some students may still be in ACT or BSIS. Please check the database.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migrateStudentsToBSIT();
