require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not set in environment');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'violations');
  fs.mkdirSync(uploadsDir, { recursive: true });

  const students = await Student.find({ 'violations.0': { $exists: true } }).lean();
  console.log(`Found ${students.length} students with violations`);

  let created = 0;
  for (const student of students) {
    const reportedByFaculty = student.violations && student.violations.length ? student.violations.map(v => v.reportedBy).filter(Boolean) : [];

    for (const v of student.violations) {
      try {
        const vid = v._id || (v.id ? v.id : null);
        if (!vid) continue;

        const filename = `violation_${String(student.studentNumber || 'unknown')}_${vid}.doc`;
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          // already generated
          continue;
        }

        const faculty = v.reportedBy ? await Faculty.findById(v.reportedBy).lean().catch(() => null) : null;
        const reportedByName = faculty ? `${faculty.firstName || ''} ${faculty.lastName || ''}`.trim() : 'A staff member';

        const reportHtml = `<!DOCTYPE html>\n<html><head><meta charset="utf-8"/><title>Violation Report</title></head><body>` +
          `<h1>Violation Report</h1>` +
          `<p><strong>Student:</strong> ${student.firstName || ''} ${student.lastName || ''} (${student.studentNumber || '—'})</p>` +
          `<p><strong>Type:</strong> ${v.violationType || '—'}</p>` +
          `<p><strong>Description:</strong><br/>${(v.description || '—').replace(/\n/g, '<br/>')}</p>` +
          `<p><strong>Sanction:</strong> ${v.sanction || '—'}</p>` +
          `<p><strong>Reported by:</strong> ${reportedByName}</p>` +
          `<p><strong>Date:</strong> ${new Date(v.date || v.createdAt || Date.now()).toLocaleString()}</p>` +
          `<hr/><p><strong>Message:</strong> ${v.message || '—'}</p>` +
          `</body></html>`;

        fs.writeFileSync(filePath, reportHtml, 'utf8');
        // attach reportUrl to the violation in DB
        try {
          const serverHost = process.env.SERVER_HOST || `http://localhost`;
          const serverPort = process.env.PORT || '5000';
          const fileUrl = `${serverHost}:${serverPort}/uploads/violations/${filename}`;
          await Student.updateOne({ _id: student._id, 'violations._id': vid }, { $set: { 'violations.$.reportUrl': fileUrl } });
        } catch (uperr) {
          console.error('Failed to attach reportUrl to DB for', filename, uperr.message || uperr);
        }
        created++;

        // Build accessible URL using localhost:PORT if present, else local file path in logs
        const host = process.env.SERVER_HOST || null; // optional override
        const port = process.env.PORT || null;
        let fileUrl = null;
        if (host && port) {
          fileUrl = `${host}:${port}/uploads/violations/${filename}`;
        }

        // Create notifications for student and recorder (if available)
        try {
          if (student.userId) {
            const note = `Violation report generated. Download: ${fileUrl || filePath}`;
            await Notification.create({ userId: student.userId, message: note });
          }

          if (faculty && faculty.userId) {
            const note = `You reported a violation. Report file: ${fileUrl || filePath}`;
            await Notification.create({ userId: faculty.userId, message: note });
          }
        } catch (nerr) {
          console.error('Failed creating notification for', filename, nerr.message || nerr);
        }
      } catch (err) {
        console.error('Error processing violation for student', student._id, err.message || err);
      }
    }
  }

  console.log(`Reports created: ${created}`);
  await mongoose.disconnect();
  console.log('Done');
}

main().catch(err => {
  console.error('Fatal error', err);
  process.exit(1);
});
