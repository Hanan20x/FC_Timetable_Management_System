/**
 * FC Timetable Management System — Express Backend
 *
 * Framework : Express.js (Node.js)
 * Pattern   : MVC (Model-View-Controller) with RESTful Web Services
 *
 * RESTful API Endpoints (base: http://localhost:3000)
 * ─────────────────────────────────────────────────────────────────────────────
 * Auth          POST /api/auth/login        → Login (username + password in body)
 *               GET  /api/auth/login        → Login (username + password in query) [legacy]
 *
 * Timetable     GET  /api/timetable/sessions/all     → All academic sessions
 *               GET  /api/timetable/sessions/current → Current session & semester
 *
 * Student       GET  /api/student/timetable/full/:id/:session/:semester → Student timetable
 *               GET  /api/student/courses/:id/:session/:semester        → Student courses
 *
 * Lecturer      GET  /api/lecturer/timetable/:staffNo/:session/:semester → Lecturer timetable
 *               GET  /api/lecturer/courses/:staffNo/:session/:semester   → Lecturer courses
 *
 * Room          GET  /api/room/availability/:roomCode → Room availability
 *               GET  /api/room/timetable/:code/:sesi/:semester → Room timetable
 *
 * Analysis      GET  /api/analysis/...
 * ─────────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const cors    = require('cors');

const authRouter     = require('./router/auth');
const timetableRouter = require('./router/timetable');
const studentRouter  = require('./router/student');
const lecturerRouter = require('./router/lecturer');
const roomRouter     = require('./router/room');
const analysisRouter = require('./router/Analysis');

const app  = express();
const PORT = 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
// Parse incoming JSON request bodies (required for POST /api/auth/login)
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Enable Cross-Origin Resource Sharing (allows the Vue frontend on port 5173
// to call this backend on port 3000)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── RESTful Routes ───────────────────────────────────────────────────────────
app.use('/api/auth',      authRouter);       // Functionality 1: Authentication
app.use('/api/timetable', timetableRouter);  // Functionality 2: Timetable sessions
app.use('/api/student',   studentRouter);    // Functionality 3: Student timetable/courses
app.use('/api/lecturer',  lecturerRouter);   // Functionality 4: Lecturer schedule
app.use('/api/room',      roomRouter);       // Functionality 5: Room availability
app.use('/api/analysis',  analysisRouter);   // Bonus: Analytics dashboard

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FC Timetable Management System API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('─────────────────────────────────────────────────────');
  console.log('  FC Timetable Management System — Backend Server');
  console.log(`  Running at: http://localhost:${PORT}`);
  console.log(`  Health:     http://localhost:${PORT}/api/health`);
  console.log('─────────────────────────────────────────────────────');
});