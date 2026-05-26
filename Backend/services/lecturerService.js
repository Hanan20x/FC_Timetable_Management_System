// services/lecturerService.js
const axios = require('axios');
const authSvc = require('./authService');

const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi';

async function fetchAllLecturers({ sesi, semester, loginSessionId, adminSessionId }) {
  if (!adminSessionId && loginSessionId) {
    adminSessionId = await authSvc.fetchAdminSession(loginSessionId);
  }

  if (!adminSessionId) throw new Error('Missing loginSessionId or adminSessionId');

  const { data } = await axios.get(TTMS_API, {
    params: {
      entity: 'pensyarah',
      session_id: adminSessionId,
      sesi,
      semester
    }
  });

  return data;
}

async function fetchLecturerCourses(staffNo, sesi, semester) {
  const { data } = await axios.get(TTMS_API, {
    params: {
      entity: 'pensyarah_subjek',
      no_pekerja: staffNo
    }
  });

  return data.filter(d =>
    String(d.sesi) === String(sesi) && String(d.semester) === String(semester)
  );
}

async function fetchLecturerTimetable(staffNo, sesi, semester) {
  const sections = await fetchLecturerCourses(staffNo, sesi, semester);
  const hariMap = { 1: 'SUN', 2: 'MON', 3: 'TUE', 4: 'WED', 5: 'THU', 6: 'FRI', 7: 'SAT' };

  const timetable = {};

  for (const section of sections) {
    const { data } = await axios.get(TTMS_API, {
      params: {
        entity: 'jadual_subjek',
        sesi,
        semester,
        kod_subjek: section.kod_subjek,
        seksyen: section.seksyen
      }
    });

    for (const item of data) {
      const day = hariMap[item.hari];
      const slot = `${item.masa}`;
      if (!timetable[day]) timetable[day] = {};
      timetable[day][slot] = {
        subject: section.kod_subjek,
        section: section.seksyen,
        venue: item.ruang?.nama_ruang_singkatan || 'TBA'
      };
    }
  }

  return timetable;
}

// Filters
function filterByName(lecturers, query) {
  return lecturers.filter(l =>
    l.nama.toLowerCase().includes(query.toLowerCase())
  );
}

function filterByStaffNo(lecturers, partial) {
  return lecturers.filter(l =>
    String(l.no_pekerja).includes(String(partial))
  );
}

module.exports = {
  fetchAllLecturers,
  fetchLecturerCourses,
  fetchLecturerTimetable,
  filterByName,
  filterByStaffNo
};
