const axios = require('axios');
const authSvc = require('./authService');
const ttSvc   = require('./timetableService');

const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi';
const PAGE_SIZE = 900;

/**
 * 1) Fetch full paginated list of students under an admin session
 */
async function fetchAllStudents(loginSessionId, sesi, semester, adminSessionId = null) {
  // Use provided adminSessionId if available, else generate from loginSessionId
  if (!adminSessionId && loginSessionId) {
    adminSessionId = await authSvc.fetchAdminSession(loginSessionId);
  }

  if (!adminSessionId) {
    throw new Error('adminSessionId or loginSessionId is required');
  }

  let offset = 0;
  const all = [];

  while (true) {
    const { data } = await axios.get(TTMS_API, {
      params: {
        entity:     'pelajar',
        session_id: adminSessionId,
        sesi,
        semester,
        limit:  PAGE_SIZE,
        offset
      }
    });
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return all;
}


/**
 * 2) Filtering helpers
 */
function filterByProgram(students, program) {
  return students.filter(s =>
    String(s.program).toLowerCase().includes(program.toLowerCase())
  );
}

function filterByYear(students, year) {
  return students.filter(s =>
    String(s.sesi_mula).startsWith(String(year))
  );
}

module.exports = {
  // admin-backed student list
  fetchAllStudents,

  // filters
  filterByProgram,
  filterByYear,

  // timetable/service wrappers
  fetchStudentSessions:      ttSvc.fetchStudentSessions,
  fetchStudentSemesters:     ttSvc.fetchStudentSemesters,
  fetchStudentCourses:       ttSvc.fetchStudentCourses,
  fetchStudentTimetable:     ttSvc.fetchStudentTimetable,
  fetchStudentDailyTimetable:ttSvc.fetchStudentDailyTimetable
};
