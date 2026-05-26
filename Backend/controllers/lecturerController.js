// controllers/lecturerController.js

const lecturerSvc = require('../services/lecturerService');
const timetableSvc = require('../services/timetableService');

module.exports = {
  // --- 1. Get full lecturer list using admin session ---
  // GET /api/lecturer?adminSessionId=...&sesi=...&semester=...
  async listAll(req, res) {
    try {
      const { loginSessionId, adminSessionId, sesi, semester } = req.query;
      if (!sesi || !semester || (!loginSessionId && !adminSessionId)) {
        return res.status(400).json({ error: 'Missing parameters' });
      }

      const lecturers = await lecturerSvc.fetchAllLecturers({
        loginSessionId,
        adminSessionId,
        sesi,
        semester
      });

      res.json(lecturers);
    } catch (err) {
      console.error('[LecturerController] listAll error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch lecturers' });
    }
  },

  // --- 2. Filter by name ---
  // GET /api/lecturer/filter/name?query=Ali&adminSessionId=...&sesi=...&semester=...
  async filterByName(req, res) {
    try {
      const { query, loginSessionId, adminSessionId, sesi, semester } = req.query;
      if (!query) return res.status(400).json({ error: 'Query is required' });

      const all = await lecturerSvc.fetchAllLecturers({
        loginSessionId,
        adminSessionId,
        sesi,
        semester
      });

      const filtered = lecturerSvc.filterByName(all, query);
      res.json(filtered);
    } catch (err) {
      console.error('[LecturerController] filterByName error:', err);
      res.status(500).json({ error: 'Failed to filter by name' });
    }
  },

  // --- 3. Filter by partial staff number ---
  // GET /api/lecturer/filter/staff?partial=12345&adminSessionId=...&sesi=...&semester=...
  async filterByStaffNo(req, res) {
    try {
      const { partial, loginSessionId, adminSessionId, sesi, semester } = req.query;
      if (!partial) return res.status(400).json({ error: 'Partial staff number required' });

      const all = await lecturerSvc.fetchAllLecturers({
        loginSessionId,
        adminSessionId,
        sesi,
        semester
      });

      const filtered = lecturerSvc.filterByStaffNo(all, partial);
      res.json(filtered);
    } catch (err) {
      console.error('[LecturerController] filterByStaffNo error:', err);
      res.status(500).json({ error: 'Failed to filter by staff number' });
    }
  },

  // --- 4. Get all courses for a lecturer ---
  // GET /api/lecturer/courses/:staffNo/:session/:semester
  async getCourses(req, res) {
    try {
      const { staffNo, session, semester } = req.params;
      if (!staffNo || !session || !semester) {
        return res.status(400).json({ error: 'Missing path parameters' });
      }

      const courses = await timetableSvc.fetchLecturerCourses(staffNo, session, semester);
      res.json(courses);
    } catch (err) {
      console.error('[LecturerController] getCourses error:', err);
      res.status(500).json({ error: 'Failed to fetch lecturer courses' });
    }
  },

  // --- 5. Get full timetable for a lecturer ---
  // GET /api/lecturer/timetable/:staffNo/:session/:semester
  async getTimetable(req, res) {
    try {
      const { staffNo, session, semester } = req.params;
      if (!staffNo || !session || !semester) {
        return res.status(400).json({ error: 'Missing path parameters' });
      }

      const timetable = await timetableSvc.fetchLecturerTimetable(staffNo, session, semester);
      res.json(timetable);
    } catch (err) {
      console.error('[LecturerController] getTimetable error:', err);
      res.status(500).json({ error: 'Failed to fetch lecturer timetable' });
    }
  }
};
