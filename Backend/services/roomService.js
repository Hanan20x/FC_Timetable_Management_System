// services/roomService.js
const axios   = require('axios');
const authSvc = require('./authService');

const TTMS_API  = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi';
const PAGE_SIZE = 900;

// 1) Fetch all rooms (optionally by faculty), paginated via adminSessionId
async function fetchAllRooms({ loginSessionId, adminSessionId, sesi, semester, faculty }) {
  if (!adminSessionId && loginSessionId) {
    adminSessionId = await authSvc.fetchAdminSession(loginSessionId);
  }
  if (!adminSessionId) throw new Error('Missing loginSessionId or adminSessionId');

  let offset = 0, all = [];
  const paramsBase = { entity: 'ruang', session_id: adminSessionId };
  if (sesi)     paramsBase.sesi     = sesi;
  if (semester) paramsBase.semester = semester;
  if (faculty)  paramsBase.kod_fakulti = faculty;

  while (true) {
    const { data } = await axios.get(TTMS_API, {
      params: { ...paramsBase, limit: PAGE_SIZE, offset }
    });
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return all;
}

// 2) Filtering helpers
function filterByName(rooms, query) {
  return rooms.filter(r =>
    (r.nama_ruang && r.nama_ruang.toLowerCase().includes(query.toLowerCase())) ||
    (r.nama_ruang_singkatan &&
       r.nama_ruang_singkatan.toLowerCase().includes(query.toLowerCase()))
  );
}

function filterByCode(rooms, code) {
  return rooms.filter(r =>
    String(r.kod_ruang).toLowerCase().includes(code.toLowerCase())
  );
}

// 3) Fetch raw schedule for a room
async function fetchRoomSchedule({ roomCode, sesi, semester }) {
  const { data } = await axios.get(TTMS_API, {
    params: {
      entity: 'jadual_ruang',
      sesi, semester,
      kod_ruang: roomCode
    }
  });
  return data;
}

// 4) Build timetable map from schedule list
function buildRoomTimetable(scheduleList) {
  const hariMap = {1:'SUN',2:'MON',3:'TUE',4:'WED',5:'THU',6:'FRI',7:'SAT'};
  const timetable = {};
  for (const item of scheduleList) {
    const day = hariMap[item.hari];
    const slot = `${item.masa}`;
    timetable[day] = timetable[day]||{};
    timetable[day][slot] = {
      subject: item.kod_subjek || 'Occupied',
      // optionally include section, lecturer etc
    };
  }
  return timetable;
}

// 5) Fetch processed timetable
async function fetchRoomTimetable({ roomCode, sesi, semester }) {
  const sched = await fetchRoomSchedule({ roomCode, sesi, semester });
  return buildRoomTimetable(sched);
}

// 6) Fetch daily timetable
async function fetchRoomDailyTimetable({ roomCode, sesi, semester, day }) {
  const sched = await fetchRoomSchedule({ roomCode, sesi, semester });
  const dayMap = { SUN:1, MON:2, TUE:3, WED:4, THU:5, FRI:6, SAT:7 };
  const dayNum = dayMap[day.toUpperCase()];
  if (!dayNum) throw new Error('Invalid day');
  return buildRoomTimetable(sched)[day.toUpperCase()] || {};
}

// 7) Check current availability (server-time)  
function checkRoomAvailability(timetable) {
  const now = new Date();
  const today = ['SUN','MON','TUE','WED','THU','FRI','SAT'][now.getDay()];
  const hour   = now.getHours() + now.getMinutes()/60;
  const slots  = timetable[today] || {};
  for (const key of Object.keys(slots)) {
    const h = parseInt(key);
    const start = h;
    const end   = h + 0.83;
    if (hour >= start && hour <= end) return 'occupied';
  }
  return 'available';
}

module.exports = {
  fetchAllRooms,
  filterByName,
  filterByCode,
  fetchRoomSchedule,
  fetchRoomTimetable,
  fetchRoomDailyTimetable,
  checkRoomAvailability
};
