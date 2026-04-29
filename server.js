const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
// CORS configuration:
// - In production, use the configured FRONTEND_URL.
// - In development, relax CORS so `http://localhost:5173` (Vite) can access
//   the API. This also allows tools like Postman (no origin) to work.
// NOTE: Keep this permissive behavior only for local development.
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));
} else {
  // Development: reflect request origin (allows localhost dev server)
  app.use(cors({
    origin: true,
    credentials: true
  }));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/enrollment', require('./routes/enrollment'));
app.use('/api/students', require('./routes/students'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/violations', require('./routes/violations'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/affiliations', require('./routes/affiliations'));
app.use('/api/organizations', require('./routes/organizations'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/instruction', require('./routes/instruction'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/events', require('./routes/events'));
app.use('/api/query', require('./routes/query'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CCS Profiling System API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
