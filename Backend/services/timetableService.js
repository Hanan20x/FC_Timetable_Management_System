const axios = require('axios');
const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi';
const hariMap = {1:'SUN',2:'MON',3:'TUE',4:'WED',5:'THU',6:'FRI',7:'SAT'};
const dayMap  = {SUN:1,MON:2,TUE:3,WED:4,THU:5,FRI:6,SAT:7};

module.exports = {
  // — General sessions/periods —
  async fetchAllSessions() {
    const { data } = await axios.get(TTMS_API, { params: { entity: 'sesisemester' } });
    return data.map(item => ({
      sesi:             item.sesi,
      semester:         item.semester,
      sessionSemesterId:item.sesi_semester_id,
      startDate:        item.tarikh_mula,
      endDate:          item.tarikh_tamat,
      display:         `${item.sesi}/S${item.semester}`
    }));
  },

  async fetchCurrentPeriod() {
    const { data } = await axios.get(TTMS_API, { params: { entity: 'sesisemester' } });
    const now = new Date();
    const current = data.find(p =>
      now >= new Date(p.tarikh_mula) && now <= new Date(p.tarikh_tamat)
    ) || data[0];
    return {
      sesi:      current.sesi,
      semester:  current.semester,
      startDate: current.tarikh_mula,
      endDate:   current.tarikh_tamat
    };
  },

  // — Student-scoped —
  async fetchStudentSessions(studentId) {
    const { data } = await axios.get(TTMS_API, {
      params: { entity: 'pelajar_subjek', no_matrik: studentId }
    });
    return [...new Set(data.map(s => s.sesi))]
      .sort((a,b)=> b - a)
      .map(sesi => ({ sesi }));
  },

  async fetchStudentSemesters(studentId, sesi) {
    const { data } = await axios.get(TTMS_API, {
      params: { entity: 'pelajar_subjek', no_matrik: studentId }
    });
    return [...new Set(data.filter(s => s.sesi===sesi).map(s=>s.semester))]
      .sort()
      .map(semester=>({ semester }));
  },

  async fetchStudentCourses(studentId, sesi, semester) {
    const { data } = await axios.get(TTMS_API, {
      params: {
        entity:   'pelajar_subjek',
        no_matrik: studentId,
        sesi, semester
      }
    });
    return data;
  },

  async fetchStudentTimetable(studentId, sesi, semester) {
    const courses = await this.fetchStudentCourses(studentId, sesi, semester);
    const tt = {};
    for (const c of courses) {
      const { data: slots } = await axios.get(TTMS_API, {
        params: {
          entity:   'jadual_subjek',
          sesi, semester,
          kod_subjek: c.kod_subjek,
          seksyen:    c.seksyen
        }
      });
      slots.forEach(item => {
        const day = hariMap[item.hari];
        const slot = item.masa;
        tt[day] = tt[day]||{};
        tt[day][slot] = {
          subject:  c.kod_subjek,
          section:  c.seksyen,
          venue:    item.ruang?.nama_ruang_singkatan || 'TBA',
          lecturer: item.pensyarah?.nama             || 'TBA'
        };
      });
    }
    return tt;
  },

  async fetchStudentDailyTimetable(studentId, sesi, semester, day) {
    const courses = await this.fetchStudentCourses(studentId, sesi, semester);
    const dayNum = dayMap[day.toUpperCase()];
    if (!dayNum) throw new Error('Invalid day');
    const daily = {};
    for (const c of courses) {
      const { data: slots } = await axios.get(TTMS_API, {
        params: {
          entity: 'jadual_subjek',
          sesi, semester,
          kod_subjek: c.kod_subjek,
          seksyen:    c.seksyen
        }
      });
      slots
        .filter(i => i.hari===dayNum)
        .forEach(item => {
          daily[item.masa] = {
            subject:  c.kod_subjek,
            section:  c.seksyen,
            venue:    item.ruang?.nama_ruang_singkatan || 'TBA',
            lecturer: item.pensyarah?.nama             || 'TBA'
          };
        });
    }
    return daily;
  },

  // — Lecturer-scoped —
  async fetchLecturerCourses(staffNo, sesi, semester) {
    const { data } = await axios.get(TTMS_API, {
      params: { entity:'pensyarah_subjek', no_pekerja:staffNo }
    });
    return data.filter(item =>
      String(item.sesi)===sesi && String(item.semester)===semester
    );
  },

  async fetchLecturerTimetable(staffNo, sesi, semester) {
    const sections = await this.fetchLecturerCourses(staffNo, sesi, semester);
    const tt = {};
    for (const s of sections) {
      const { data: slots } = await axios.get(TTMS_API, {
        params: {
          entity:   'jadual_subjek',
          sesi, semester,
          kod_subjek: s.kod_subjek,
          seksyen:    s.seksyen
        }
      });
      slots.forEach(item => {
        const day  = hariMap[item.hari];
        const slot = item.masa;
        tt[day] = tt[day]||{};
        tt[day][slot] = {
          subject: s.kod_subjek,
          section: s.seksyen,
          venue:   item.ruang?.nama_ruang_singkatan || 'TBA'
        };
      });
    }
    return tt;
  }
};
