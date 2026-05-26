const svc = require('../services/studentService');

module.exports = {
  // --- 1. Admin-backed student list ---
  // GET /api/student?loginSessionId=...&sesi=...&semester=...
 async listAll(req, res) {
  try {
    const { loginSessionId, adminSessionId, sesi, semester } = req.query;
    if (!sesi || !semester) {
      return res.status(400).json({ error: 'Missing sesi or semester' });
    }

    // Either loginSessionId or adminSessionId is required
    if (!loginSessionId && !adminSessionId) {
      return res.status(400).json({ error: 'Missing loginSessionId or adminSessionId' });
    }

    const students = await svc.fetchAllStudents(loginSessionId, sesi, semester, adminSessionId);
    res.json(students);
  } catch (err) {
    console.error('[StudentController] listAll error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch students' });
  }
},


  // --- 2. Filters (expects full list to be fetched by client and passed in) ---

  // GET /api/student/filter/program?program=...&sesi=...&semester=...&adminSessionId=...
async searchByProgram(req, res) {
  try {
    const { loginSessionId, adminSessionId, sesi, semester, program } = req.query;

    if (!sesi || !semester || (!loginSessionId && !adminSessionId)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const allStudents = await svc.fetchAllStudents(loginSessionId, sesi, semester, adminSessionId);
    const filtered = program ? svc.filterByProgram(allStudents, program) : allStudents;

    res.json(filtered);
  } catch (err) {
    console.error('[StudentController] searchByProgram error:', err);
    res.status(500).json({ error: 'Failed to filter by program' });
  }
},


  // GET /api/student/filter/year?year=...&students=[JSON array]
  // GET /api/student/filter/year?year=...&sesi=...&semester=...&adminSessionId=...
async searchByYear(req, res) {
  try {
    const { loginSessionId, adminSessionId, sesi, semester, year } = req.query;

    if (!sesi || !semester || (!loginSessionId && !adminSessionId)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const allStudents = await svc.fetchAllStudents(loginSessionId, sesi, semester, adminSessionId);
    const filtered = year ? svc.filterByYear(allStudents, year) : allStudents;

    res.json(filtered);
  } catch (err) {
    console.error('[StudentController] searchByYear error:', err);
    res.status(500).json({ error: 'Failed to filter by year' });
  }
}
,

  // --- 3. Timetable endpoints (student-scoped) ---

  // GET /api/student/sessions/:studentId
  async getAvailableSessions(req, res) {
    try {
      const { studentId } = req.params;
      res.json(await svc.fetchStudentSessions(studentId));
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch available sessions' });
    }
  },

  // GET /api/student/sessions/:studentId/:session/semesters
  async getAvailableSemesters(req, res) {
    try {
      const { studentId, session } = req.params;
      res.json(await svc.fetchStudentSemesters(studentId, session));
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch semesters' });
    }
  },

  // GET /api/student/courses/:studentId/:session/:semester
  async getCourses(req, res) {
    try {
      const { studentId, session, semester } = req.params;
      res.json(await svc.fetchStudentCourses(studentId, session, semester));
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  },

  // GET /api/student/timetable/full/:studentId/:session/:semester
  async getFullTimetable(req, res) {
    try {
      const { studentId, session, semester } = req.params;
      res.json(await svc.fetchStudentTimetable(studentId, session, semester));
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch full timetable' });
    }
  },

  // GET /api/student/timetable/daily/:studentId/:session/:semester/:day
  async getDailyTimetable(req, res) {
    try {
      const { studentId, session, semester, day } = req.params;
      res.json(await svc.fetchStudentDailyTimetable(studentId, session, semester, day));
    } catch (e) {
      res.status(400).json({ error: e.message || 'Failed to fetch daily timetable' });
    }
  },
  // GET /api/student/filter?program=...&year=...&sesi=...&semester=...&adminSessionId=...
async filter(req, res) {
  try {
    const { loginSessionId, adminSessionId, sesi, semester, program, year } = req.query;

    const all = await svc.fetchAllStudents(loginSessionId, sesi, semester, adminSessionId);

    let filtered = all;
    if (program) filtered = svc.filterByProgram(filtered, program);
    if (year)    filtered = svc.filterByYear(filtered, year);

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply filters' });
  }
}

};
