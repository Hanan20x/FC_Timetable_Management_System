const axios = require('axios');
const fetch = require('node-fetch');
const authSvc = require('./authService');
const studentSvc = require('./studentService');
const lecturerSvc = require('./lecturerService');
const roomSvc = require('./roomService');
const ttSvc = require('./timetableService');

const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi';

// ============================================================================
// STUDENT ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get students over the years with statistics
 */
async function getStudentsOverYears(loginSessionId, adminSessionId = null) {
  if (!adminSessionId && loginSessionId) {
    adminSessionId = await authSvc.fetchAdminSession(loginSessionId);
  }

  // Get all available sessions
  const sessions = await ttSvc.fetchAllSessions();
  const semesterStats = [];

  for (const session of sessions) {
    try {
      const students = await studentSvc.fetchAllStudents(
        loginSessionId, 
        session.sesi, 
        session.semester, 
        adminSessionId
      );

      // Group by faculty (kod_fakulti)
      const facultyStats = {};
      // Group by program (kod_kursus)
      const programStats = {};
      // Group by year level (tahun_kursus)
      const yearLevelStats = {};

      students.forEach(student => {
        const faculty = student.kod_fakulti || 'Unknown';
        const program = student.kod_kursus || 'Unknown';
        const yearLevel = student.tahun_kursus || 'Unknown';

        facultyStats[faculty] = (facultyStats[faculty] || 0) + 1;
        programStats[program] = (programStats[program] || 0) + 1;
        yearLevelStats[yearLevel] = (yearLevelStats[yearLevel] || 0) + 1;
      });

      semesterStats.push({
        year: session.sesi,
        semester: session.semester,
        totalStudents: students.length,
        faculties: Object.keys(facultyStats).map(faculty => ({
          name: faculty,
          count: facultyStats[faculty]
        })),
        programs: Object.keys(programStats).map(program => ({
          name: program,
          count: programStats[program]
        })),
        yearLevels: Object.keys(yearLevelStats).map(yearLevel => ({
          name: `Year ${yearLevel}`,
          count: yearLevelStats[yearLevel]
        }))
      });

    } catch (error) {
      console.error(`Error fetching data for ${session.sesi}/${session.semester}:`, error.message);
    }
  }

  return semesterStats.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.semester - a.semester;
  });
}

/**
 * Get student statistics by year and semester with faculty, program, and year level breakdowns
 */
async function getStudentStatsByYearAndProgram(loginSessionId, year, semester, adminSessionId = null) {
  if (!adminSessionId && loginSessionId) {
    adminSessionId = await authSvc.fetchAdminSession(loginSessionId);
  }

  try {
    const students = await studentSvc.fetchAllStudents(
      loginSessionId,
      year,
      semester,
      adminSessionId
    );

    // Group by faculty (kod_fakulti)
    const facultyStats = {};
    // Group by program (kod_kursus)
    const programStats = {};
    // Group by year level (tahun_kursus)
    const yearLevelStats = {};

    students.forEach(student => {
      const faculty = student.kod_fakulti || 'Unknown';
      const program = student.kod_kursus || 'Unknown';
      const yearLevel = student.tahun_kursus || 'Unknown';

      // Faculty stats
      facultyStats[faculty] = (facultyStats[faculty] || 0) + 1;

      // Program stats
      programStats[program] = (programStats[program] || 0) + 1;

      // Year level stats
      yearLevelStats[yearLevel] = (yearLevelStats[yearLevel] || 0) + 1;
    });

    const stats = {
      year,
      semester,
      totalStudents: students.length,
      faculties: Object.keys(facultyStats).map(faculty => ({
        name: faculty,
        totalStudents: facultyStats[faculty]
      })),
      programs: Object.keys(programStats).map(program => ({
        name: program,
        totalStudents: programStats[program]
      })),
      yearLevels: Object.keys(yearLevelStats).map(yearLevel => ({
        name: `Year ${yearLevel}`,
        totalStudents: yearLevelStats[yearLevel]
      }))
    };

    return stats;

  } catch (error) {
    console.error(`Error fetching data for ${year}/${semester}:`, error.message);
    throw error;
  }
}

// ============================================================================
// LECTURER ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get lecturer workload analysis
 */
async function getLecturerWorkload(sesi, semester, loginSessionId, adminSessionId = null) {
  if (!adminSessionId && loginSessionId) {
    adminSessionId = await authSvc.fetchAdminSession(loginSessionId);
  }

  const lecturers = await lecturerSvc.fetchAllLecturers({ sesi, semester, loginSessionId, adminSessionId });
  const workloadData = [];

  for (const lecturer of lecturers) {
    try {
      const courses = await lecturerSvc.fetchLecturerCourses(lecturer.no_pekerja, sesi, semester);
      const timetable = await lecturerSvc.fetchLecturerTimetable(lecturer.no_pekerja, sesi, semester);
      
      // Calculate total hours
      let totalHours = 0;
      const scheduleSlots = {};
      
      Object.keys(timetable).forEach(day => {
        Object.keys(timetable[day]).forEach(time => {
          totalHours += 1; // Each slot is typically 1 hour
          const key = `${day}_${time}`;
          scheduleSlots[key] = timetable[day][time];
        });
      });

      workloadData.push({
        staffNo: lecturer.no_pekerja,
        name: lecturer.nama,
        totalCourses: courses.length,
        totalSections: courses.length,
        totalHours,
        scheduleSlots,
        courses: courses.map(c => ({
          code: c.kod_subjek,
          section: c.seksyen
        }))
      });

    } catch (error) {
      console.error(`Error fetching workload for lecturer ${lecturer.no_pekerja}:`, error.message);
    }
  }

  return workloadData.sort((a, b) => b.totalHours - a.totalHours);
}

/**
 * Get top lecturers by sections/work hours
 */
async function getTopLecturers(sesi, semester, loginSessionId, adminSessionId = null, limit = 10) {
  const workload = await getLecturerWorkload(sesi, semester, loginSessionId, adminSessionId);
  
  return {
    bySections: workload
      .sort((a, b) => b.totalSections - a.totalSections)
      .slice(0, limit)
      .map(l => ({
        staffNo: l.staffNo,
        name: l.name,
        totalSections: l.totalSections,
        totalHours: l.totalHours
      })),
    byHours: workload
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, limit)
      .map(l => ({
        staffNo: l.staffNo,
        name: l.name,
        totalHours: l.totalHours,
        totalSections: l.totalSections
      }))
  };
}

/**
 * Check for lecturer conflicts (same lecturer teaching multiple courses at same time)
 */
async function checkLecturerConflicts(sesi, semester, loginSessionId, adminSessionId = null) {
  const workload = await getLecturerWorkload(sesi, semester, loginSessionId, adminSessionId);
  const conflicts = [];

  workload.forEach(lecturer => {
    const timeSlots = {};
    
    Object.keys(lecturer.scheduleSlots).forEach(slot => {
      if (!timeSlots[slot]) {
        timeSlots[slot] = [];
      }
      timeSlots[slot].push(lecturer.scheduleSlots[slot]);
    });

    // Check for conflicts
    Object.keys(timeSlots).forEach(slot => {
      if (timeSlots[slot].length > 1) {
        conflicts.push({
          lecturer: {
            staffNo: lecturer.staffNo,
            name: lecturer.name
          },
          timeSlot: slot,
          conflictingCourses: timeSlots[slot]
        });
      }
    });
  });

  return conflicts;
}

// ============================================================================
// COURSE ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get sections statistics (number of students per section)
 */
async function getSectionStatistics(sesi, semester, loginSessionId, adminSessionId = null) {
  if (!adminSessionId && loginSessionId) {
    adminSessionId = await authSvc.fetchAdminSession(loginSessionId);
  }

  try {
    // Fetch courses directly from TTMS API (faster approach)
    const coursesData = await fetchJSON({
      entity: 'subjek',
      sesi,
      semester
    });

    // Transform the data to section statistics format
    const sectionStats = [];
    
    coursesData.forEach(course => {
      if (course.bil_seksyen > 0) {
        // For each section in the course
        for (let sectionNum = 1; sectionNum <= course.bil_seksyen; sectionNum++) {
          const sectionKey = `${course.kod_subjek}_${sectionNum}`;
          
          // Calculate students per section (distribute evenly or use actual data if available)
          const studentsPerSection = Math.ceil(course.bil_pelajar / course.bil_seksyen);
          
          sectionStats.push({
            subjectCode: course.kod_subjek,
            section: sectionNum.toString(),
            studentCount: studentsPerSection,
            courseName: course.nama_subjek || 'No description'
          });
        }
      }
    });

    return sectionStats.sort((a, b) => b.studentCount - a.studentCount);

  } catch (error) {
    console.error(`Error fetching section statistics for ${sesi}/${semester}:`, error.message);
    throw error;
  }
}

/**
 * Helper function to fetch JSON from TTMS API
 */
async function fetchJSON(params) {
  const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi';
  const url = `${TTMS_API}?${new URLSearchParams(params)}`;
  const res = await fetch(url);
  const json = await res.json();
  return json;
}

/**
 * Get course statistics (aggregated by course code)
 */
async function getCourseStatistics(sesi, semester, loginSessionId, adminSessionId = null) {
  if (!adminSessionId && loginSessionId) {
    adminSessionId = await authSvc.fetchAdminSession(loginSessionId);
  }

  try {
    // Fetch courses directly from TTMS API (faster approach)
    const coursesData = await fetchJSON({
      entity: 'subjek',
      sesi,
      semester
    });

    // Transform the data to course statistics format
    const courseStats = coursesData.map(course => {
      // Generate section numbers array
      const sections = [];
      for (let i = 1; i <= course.bil_seksyen; i++) {
        sections.push(i.toString());
      }

      return {
        subjectCode: course.kod_subjek,
        courseName: course.nama_subjek || 'No description',
        totalStudents: course.bil_pelajar || 0,
        sections: sections,
        sectionCount: course.bil_seksyen || 0,
        lecturerCount: course.bil_pensyarah || 0
      };
    });

    return courseStats.sort((a, b) => b.totalStudents - a.totalStudents);

  } catch (error) {
    console.error(`Error fetching course statistics for ${sesi}/${semester}:`, error.message);
    throw error;
  }
}

/**
 * Get top sections with registered students
 */
async function getTopSections(sesi, semester, loginSessionId, adminSessionId = null, limit = 10) {
  const sectionStats = await getSectionStatistics(sesi, semester, loginSessionId, adminSessionId);
  
  return sectionStats.slice(0, limit).map(section => ({
    subjectCode: section.subjectCode,
    section: section.section,
    studentCount: section.studentCount
  }));
}

/**
 * Get top courses with registered students
 */
async function getTopCourses(sesi, semester, loginSessionId, adminSessionId = null, limit = 10) {
  const courseStats = await getCourseStatistics(sesi, semester, loginSessionId, adminSessionId);
  
  return courseStats.slice(0, limit).map(course => ({
    subjectCode: course.subjectCode,
    courseName: course.courseName,
    totalStudents: course.totalStudents,
    sectionCount: course.sectionCount,
    sections: course.sections,
    lecturerCount: course.lecturerCount
  }));
}

/**
 * Check for course conflicts (courses with multiple sections)
 */
async function checkCourseConflicts(sesi, semester, loginSessionId, adminSessionId = null) {
  const courseStats = await getCourseStatistics(sesi, semester, loginSessionId, adminSessionId);
  const conflicts = [];

  // Find courses with multiple sections (potential conflicts)
  courseStats.forEach(course => {
    if (course.sectionCount > 1) {
      conflicts.push({
        subjectCode: course.subjectCode,
        courseName: course.courseName,
        totalSections: course.sectionCount,
        totalStudents: course.totalStudents,
        sections: course.sections,
        lecturerCount: course.lecturerCount
      });
    }
  });

  return conflicts.sort((a, b) => b.totalStudents - a.totalStudents);
}

// ============================================================================
// ROOM ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Check for room clashes
 */
async function checkRoomClashes(sesi, semester, loginSessionId, adminSessionId = null) {
  if (!adminSessionId && loginSessionId) {
    adminSessionId = await authSvc.fetchAdminSession(loginSessionId);
  }

  const rooms = await roomSvc.fetchAllRooms({ loginSessionId, adminSessionId, sesi, semester });
  const clashes = [];

  for (const room of rooms) {
    try {
      const schedule = await roomSvc.fetchRoomSchedule({ 
        roomCode: room.kod_ruang, 
        sesi, 
        semester 
      });

      const timeSlots = {};
      
      schedule.forEach(item => {
        const day = item.hari;
        const time = item.masa;
        const key = `${day}_${time}`;
        
        if (!timeSlots[key]) {
          timeSlots[key] = [];
        }
        timeSlots[key].push({
          subject: item.kod_subjek,
          section: item.seksyen,
          lecturer: item.pensyarah?.nama || 'Unknown'
        });
      });

      // Check for conflicts
      Object.keys(timeSlots).forEach(slot => {
        if (timeSlots[slot].length > 1) {
          clashes.push({
            room: {
              code: room.kod_ruang,
              name: room.nama_ruang || room.nama_ruang_singkatan
            },
            timeSlot: slot,
            conflictingSessions: timeSlots[slot]
          });
        }
      });

    } catch (error) {
      console.error(`Error checking clashes for room ${room.kod_ruang}:`, error.message);
    }
  }

  return clashes;
}

/**
 * Get room utilization statistics
 */
async function getRoomUtilization(sesi, semester, loginSessionId, adminSessionId = null) {
  if (!adminSessionId && loginSessionId) {
    adminSessionId = await authSvc.fetchAdminSession(loginSessionId);
  }

  const rooms = await roomSvc.fetchAllRooms({ loginSessionId, adminSessionId, sesi, semester });
  const utilization = [];

  for (const room of rooms) {
    try {
      const schedule = await roomSvc.fetchRoomSchedule({ 
        roomCode: room.kod_ruang, 
        sesi, 
        semester 
      });

      // Calculate realistic utilization (assuming 8-hour workday, 5 days a week)
      const totalSlots = 5 * 8; // 5 days * 8 hours = 40 slots per week
      const occupiedSlots = schedule.length;
      const utilizationRate = Math.min((occupiedSlots / totalSlots) * 100, 100); // Cap at 100%

      utilization.push({
        roomCode: room.kod_ruang,
        roomName: room.nama_ruang || room.nama_ruang_singkatan,
        totalSlots,
        occupiedSlots,
        utilizationRate: Math.round(utilizationRate * 100) / 100
      });

    } catch (error) {
      console.error(`Error getting utilization for room ${room.kod_ruang}:`, error.message);
    }
  }

  return utilization.sort((a, b) => b.utilizationRate - a.utilizationRate);
}

// ============================================================================
// GENERAL ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get comprehensive system overview
 */
async function getSystemOverview(sesi, semester, loginSessionId, adminSessionId = null) {
  if (!adminSessionId && loginSessionId) {
    adminSessionId = await authSvc.fetchAdminSession(loginSessionId);
  }

  try {
    const [students, lecturers, rooms] = await Promise.all([
      studentSvc.fetchAllStudents(loginSessionId, sesi, semester, adminSessionId),
      lecturerSvc.fetchAllLecturers({ sesi, semester, loginSessionId, adminSessionId }),
      roomSvc.fetchAllRooms({ loginSessionId, adminSessionId, sesi, semester })
    ]);

    const sectionStats = await getSectionStatistics(sesi, semester, loginSessionId, adminSessionId);
    const roomUtilization = await getRoomUtilization(sesi, semester, loginSessionId, adminSessionId);

    // Group students by faculty, program, and year level for better overview
    const facultyStats = {};
    const programStats = {};
    const yearLevelStats = {};
    
    students.forEach(student => {
      const faculty = student.kod_fakulti || 'Unknown';
      const program = student.kod_kursus || 'Unknown';
      const yearLevel = student.tahun_kursus || 'Unknown';
      
      facultyStats[faculty] = (facultyStats[faculty] || 0) + 1;
      programStats[program] = (programStats[program] || 0) + 1;
      yearLevelStats[yearLevel] = (yearLevelStats[yearLevel] || 0) + 1;
    });

    return {
      period: { sesi, semester },
      summary: {
        totalStudents: students.length,
        totalLecturers: lecturers.length,
        totalRooms: rooms.length,
        totalSections: sectionStats.length
      },
      facultyBreakdown: Object.keys(facultyStats).map(faculty => ({
        name: faculty,
        count: facultyStats[faculty]
      })),
      programBreakdown: Object.keys(programStats).map(program => ({
        name: program,
        count: programStats[program]
      })),
      yearLevelBreakdown: Object.keys(yearLevelStats).map(yearLevel => ({
        name: `Year ${yearLevel}`,
        count: yearLevelStats[yearLevel]
      })),
      topStats: {
        topSections: sectionStats.slice(0, 5),
        topUtilizedRooms: roomUtilization.slice(0, 5)
      }
    };

  } catch (error) {
    console.error('Error getting system overview:', error.message);
    throw error;
  }
}

module.exports = {
  // Student Analysis
  getStudentsOverYears,
  getStudentStatsByYearAndProgram,
  
  // Lecturer Analysis
  getLecturerWorkload,
  getTopLecturers,
  checkLecturerConflicts,
  
  // Course Analysis
  getSectionStatistics,
  getCourseStatistics,
  getTopSections,
  getTopCourses,
  checkCourseConflicts,
  
  // Room Analysis
  checkRoomClashes,
  getRoomUtilization,
  
  // General Analysis
  getSystemOverview
};
