const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/AnalysisController');

// ============================================================================
// STUDENT ANALYSIS ROUTES
// ============================================================================

/**
 * GET /api/analysis/students/over-years
 * Get students statistics over the years
 * Query params: loginSessionId, adminSessionId
 */
router.get('/students/over-years', analysisController.getStudentsOverYears);

/**
 * GET /api/analysis/students/stats/:year
 * Get student statistics by year and program
 * Params: year
 * Query params: loginSessionId, adminSessionId
 */
router.get('/students/stats/:year', analysisController.getStudentStatsByYear);

// ============================================================================
// LECTURER ANALYSIS ROUTES
// ============================================================================

/**
 * GET /api/analysis/lecturers/workload
 * Get lecturer workload analysis
 * Query params: sesi, semester, loginSessionId, adminSessionId
 */
router.get('/lecturers/workload', analysisController.getLecturerWorkload);

/**
 * GET /api/analysis/lecturers/top
 * Get top lecturers by sections/work hours
 * Query params: sesi, semester, loginSessionId, adminSessionId, limit (optional, default: 10)
 */
router.get('/lecturers/top', analysisController.getTopLecturers);

/**
 * GET /api/analysis/lecturers/conflicts
 * Check for lecturer conflicts
 * Query params: sesi, semester, loginSessionId, adminSessionId
 */
router.get('/lecturers/conflicts', analysisController.checkLecturerConflicts);

// ============================================================================
// COURSE ANALYSIS ROUTES
// ============================================================================

/**
 * GET /api/analysis/courses/sections
 * Get sections statistics (number of students per section)
 * Query params: sesi, semester, loginSessionId, adminSessionId
 */
router.get('/courses/sections', analysisController.getSectionStatistics);

/**
 * GET /api/analysis/courses/courses
 * Get course statistics (aggregated by course code)
 * Query params: sesi, semester, loginSessionId, adminSessionId
 */
router.get('/courses/courses', analysisController.getCourseStatistics);

/**
 * GET /api/analysis/courses/top-courses
 * Get top courses with registered students
 * Query params: sesi, semester, loginSessionId, adminSessionId, limit (optional, default: 10)
 */
router.get('/courses/top-courses', analysisController.getTopCourses);

/**
 * GET /api/analysis/courses/top-sections
 * Get top sections with registered students
 * Query params: sesi, semester, loginSessionId, adminSessionId, limit (optional, default: 10)
 */
router.get('/courses/top-sections', analysisController.getTopSections);

/**
 * GET /api/analysis/courses/conflicts
 * Check for course conflicts
 * Query params: sesi, semester, loginSessionId, adminSessionId
 */
router.get('/courses/conflicts', analysisController.checkCourseConflicts);

// ============================================================================
// ROOM ANALYSIS ROUTES
// ============================================================================

/**
 * GET /api/analysis/rooms/clashes
 * Check for room clashes
 * Query params: sesi, semester, loginSessionId, adminSessionId
 */
router.get('/rooms/clashes', analysisController.checkRoomClashes);

/**
 * GET /api/analysis/rooms/utilization
 * Get room utilization statistics
 * Query params: sesi, semester, loginSessionId, adminSessionId
 */
router.get('/rooms/utilization', analysisController.getRoomUtilization);

// ============================================================================
// GENERAL ANALYSIS ROUTES
// ============================================================================

/**
 * GET /api/analysis/overview
 * Get comprehensive system overview
 * Query params: sesi, semester, loginSessionId, adminSessionId
 */
router.get('/overview', analysisController.getSystemOverview);

/**
 * GET /api/analysis/bulk
 * Get multiple analysis reports in one request
 * Query params: sesi, semester, loginSessionId, adminSessionId, reports (optional array)
 */
router.get('/bulk', analysisController.getBulkAnalysis);

// ============================================================================
// API DOCUMENTATION ROUTE
// ============================================================================

/**
 * GET /api/analysis/docs
 * Get API documentation
 */
router.get('/docs', (req, res) => {
  res.json({
    message: 'Analysis API Documentation',
    version: '1.0.0',
    endpoints: {
      students: {
        'GET /students/over-years': 'Get students statistics over the years',
        'GET /students/stats/:year': 'Get student statistics by year and program'
      },
      lecturers: {
        'GET /lecturers/workload': 'Get lecturer workload analysis',
        'GET /lecturers/top': 'Get top lecturers by sections/work hours',
        'GET /lecturers/conflicts': 'Check for lecturer conflicts'
      },
      courses: {
        'GET /courses/sections': 'Get sections statistics (number of students per section)',
        'GET /courses/courses': 'Get course statistics (aggregated by course code)',
        'GET /courses/top-sections': 'Get top sections with registered students',
        'GET /courses/top-courses': 'Get top courses with registered students',
        'GET /courses/conflicts': 'Check for course conflicts'
      },
      rooms: {
        'GET /rooms/clashes': 'Check for room clashes',
        'GET /rooms/utilization': 'Get room utilization statistics'
      },
      general: {
        'GET /overview': 'Get comprehensive system overview',
        'GET /bulk': 'Get multiple analysis reports in one request'
      }
    },
    commonQueryParams: {
      sesi: 'Session year (required for most endpoints)',
      semester: 'Semester number (required for most endpoints)',
      loginSessionId: 'Login session ID (required if adminSessionId not provided)',
      adminSessionId: 'Admin session ID (required if loginSessionId not provided)',
      limit: 'Limit number of results (optional, default varies by endpoint)'
    },
    examples: {
      'Student Analysis': {
        'Get students over years': 'GET /api/analysis/students/over-years?loginSessionId=your_session_id',
        'Get student stats by year': 'GET /api/analysis/students/stats/2024?loginSessionId=your_session_id'
      },
      'Lecturer Analysis': {
        'Get lecturer workload': 'GET /api/analysis/lecturers/workload?sesi=2024&semester=1&loginSessionId=your_session_id',
        'Get top lecturers': 'GET /api/analysis/lecturers/top?sesi=2024&semester=1&loginSessionId=your_session_id&limit=5'
      },
      'Course Analysis': {
        'Get section statistics': 'GET /api/analysis/courses/sections?sesi=2024&semester=1&loginSessionId=your_session_id',
        'Get course statistics': 'GET /api/analysis/courses/courses?sesi=2024&semester=1&loginSessionId=your_session_id',
        'Get top sections': 'GET /api/analysis/courses/top-sections?sesi=2024&semester=1&loginSessionId=your_session_id&limit=10',
        'Get top courses': 'GET /api/analysis/courses/top-courses?sesi=2024&semester=1&loginSessionId=your_session_id&limit=10'
      },
      'Room Analysis': {
        'Check room clashes': 'GET /api/analysis/rooms/clashes?sesi=2024&semester=1&loginSessionId=your_session_id',
        'Get room utilization': 'GET /api/analysis/rooms/utilization?sesi=2024&semester=1&loginSessionId=your_session_id'
      },
      'Bulk Analysis': {
        'Get all reports': 'GET /api/analysis/bulk?sesi=2024&semester=1&loginSessionId=your_session_id',
        'Get specific reports': 'GET /api/analysis/bulk?sesi=2024&semester=1&loginSessionId=your_session_id&reports[]=lecturer-workload&reports[]=room-clashes'
      }
    }
  });
});

module.exports = router;
