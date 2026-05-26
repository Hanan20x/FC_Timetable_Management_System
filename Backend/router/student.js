/**
 * RESTful Web Service — Student Timetable Router
 *
 * Base URL: /api/student
 *
 * Endpoints (Functionality 2 — Student Timetable):
 *
 *   GET /api/student/sessions/:studentId
 *     → List all academic sessions available for a student
 *
 *   GET /api/student/sessions/:studentId/:session/semesters
 *     → List all semesters within a session for a student
 *
 *   GET /api/student/courses/:studentId/:session/:semester
 *     → List all courses a student is enrolled in
 *
 *   GET /api/student/timetable/full/:studentId/:session/:semester   ⭐ RESTful WS #2
 *     → Get the complete weekly timetable for a student
 *     → Response: { MON: { 1: {...}, 2: {...} }, TUE: {...}, ... }
 *
 *   GET /api/student/timetable/daily/:studentId/:session/:semester/:day
 *     → Get timetable for a specific day (MON, TUE, WED, THU, FRI)
 *
 *   GET /api/student/filter?program=SECJ&year=2&...
 *     → Filter students by program and/or year
 */

const express = require('express');
const router  = express.Router();
const studentController = require('../controllers/studentController');

// List all students (admin session required)
router.get('/', studentController.listAll);

// Filter endpoints
router.get('/filter/program', studentController.searchByProgram);
router.get('/filter/year',    studentController.searchByYear);
router.get('/filter',         studentController.filter);

// Available sessions & semesters for a student
router.get('/sessions/:studentId',                          studentController.getAvailableSessions);
router.get('/sessions/:studentId/:session/semesters',       studentController.getAvailableSemesters);

// Courses enrolled
router.get('/courses/:studentId/:session/:semester',        studentController.getCourses);

// ⭐ RESTful Web Service #2 — Full student timetable
router.get('/timetable/full/:studentId/:session/:semester', studentController.getFullTimetable);

// Daily timetable for a specific day
router.get('/timetable/daily/:studentId/:session/:semester/:day', studentController.getDailyTimetable);

module.exports = router;
