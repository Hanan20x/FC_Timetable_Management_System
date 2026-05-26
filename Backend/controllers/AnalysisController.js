const analysisSvc = require('../services/AnalysisService');

module.exports = {
  // ============================================================================
  // STUDENT ANALYSIS ENDPOINTS
  // ============================================================================

  /**
   * GET /api/analysis/students/over-years
   * Get students statistics over the years
   */
  async getStudentsOverYears(req, res) {
    try {
      const { loginSessionId, adminSessionId } = req.query;
      
      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      // Prefer adminSessionId if available
      const sessionId = adminSessionId || loginSessionId;
      const isAdmin = !!adminSessionId;
      
      const yearStats = await analysisSvc.getStudentsOverYears(
        isAdmin ? null : sessionId, 
        isAdmin ? sessionId : null
      );
      res.json({
        success: true,
        data: yearStats,
        message: 'Student statistics over years retrieved successfully'
      });

    } catch (error) {
      console.error('[AnalysisController] getStudentsOverYears error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch student statistics over years',
        details: error.message 
      });
    }
  },

  /**
   * GET /api/analysis/students/stats/:year
   * Get student statistics by year and semester
   */
  async getStudentStatsByYear(req, res) {
    try {
      const { year } = req.params;
      const { semester, loginSessionId, adminSessionId } = req.query;
      
      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      if (!year) {
        return res.status(400).json({ 
          error: 'Missing year parameter' 
        });
      }

      if (!semester) {
        return res.status(400).json({ 
          error: 'Missing semester parameter' 
        });
      }

      // Prefer adminSessionId if available
      const sessionId = adminSessionId || loginSessionId;
      const isAdmin = !!adminSessionId;

      const stats = await analysisSvc.getStudentStatsByYearAndProgram(
        isAdmin ? null : sessionId, 
        year, 
        semester, 
        isAdmin ? sessionId : null
      );
      res.json({
        success: true,
        data: stats,
        message: `Student statistics for year ${year} semester ${semester} retrieved successfully`
      });

    } catch (error) {
      console.error('[AnalysisController] getStudentStatsByYear error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch student statistics by year and semester',
        details: error.message 
      });
    }
  },

  // ============================================================================
  // LECTURER ANALYSIS ENDPOINTS
  // ============================================================================

  /**
   * GET /api/analysis/lecturers/workload
   * Get lecturer workload analysis
   */
  async getLecturerWorkload(req, res) {
    try {
      const { sesi, semester, loginSessionId, adminSessionId } = req.query;
      
      if (!sesi || !semester) {
        return res.status(400).json({ 
          error: 'Missing sesi or semester parameters' 
        });
      }

      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      // Prefer adminSessionId if available
      const sessionId = adminSessionId || loginSessionId;
      const isAdmin = !!adminSessionId;
      
      const workload = await analysisSvc.getLecturerWorkload(
        sesi, 
        semester, 
        isAdmin ? null : sessionId, 
        isAdmin ? sessionId : null
      );
      res.json({
        success: true,
        data: workload,
        message: 'Lecturer workload analysis retrieved successfully'
      });

    } catch (error) {
      console.error('[AnalysisController] getLecturerWorkload error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch lecturer workload',
        details: error.message 
      });
    }
  },

  /**
   * GET /api/analysis/lecturers/top
   * Get top lecturers by sections/work hours
   */
  async getTopLecturers(req, res) {
    try {
      const { sesi, semester, loginSessionId, adminSessionId, limit = 10 } = req.query;
      
      if (!sesi || !semester) {
        return res.status(400).json({ 
          error: 'Missing sesi or semester parameters' 
        });
      }

      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      const topLecturers = await analysisSvc.getTopLecturers(sesi, semester, loginSessionId, adminSessionId, parseInt(limit));
      res.json({
        success: true,
        data: topLecturers,
        message: 'Top lecturers retrieved successfully'
      });

    } catch (error) {
      console.error('[AnalysisController] getTopLecturers error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch top lecturers',
        details: error.message 
      });
    }
  },

  /**
   * GET /api/analysis/lecturers/conflicts
   * Check for lecturer conflicts
   */
  async checkLecturerConflicts(req, res) {
    try {
      const { sesi, semester, loginSessionId, adminSessionId } = req.query;
      
      if (!sesi || !semester) {
        return res.status(400).json({ 
          error: 'Missing sesi or semester parameters' 
        });
      }

      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      const conflicts = await analysisSvc.checkLecturerConflicts(sesi, semester, loginSessionId, adminSessionId);
      res.json({
        success: true,
        data: conflicts,
        message: `Found ${conflicts.length} lecturer conflicts`,
        count: conflicts.length
      });

    } catch (error) {
      console.error('[AnalysisController] checkLecturerConflicts error:', error);
      res.status(500).json({ 
        error: 'Failed to check lecturer conflicts',
        details: error.message 
      });
    }
  },

  // ============================================================================
  // COURSE ANALYSIS ENDPOINTS
  // ============================================================================

  /**
   * GET /api/analysis/courses/sections
   * Get sections statistics (number of students)
   */
  async getSectionStatistics(req, res) {
    try {
      const { sesi, semester, loginSessionId, adminSessionId } = req.query;
      
      if (!sesi || !semester) {
        return res.status(400).json({ 
          error: 'Missing sesi or semester parameters' 
        });
      }

      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      const sectionStats = await analysisSvc.getSectionStatistics(sesi, semester, loginSessionId, adminSessionId);
      res.json({
        success: true,
        data: sectionStats,
        message: 'Section statistics retrieved successfully'
      });

    } catch (error) {
      console.error('[AnalysisController] getSectionStatistics error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch section statistics',
        details: error.message 
      });
    }
  },

  /**
   * GET /api/analysis/courses/courses
   * Get course statistics (aggregated by course code)
   */
  async getCourseStatistics(req, res) {
    try {
      const { sesi, semester, loginSessionId, adminSessionId } = req.query;
      
      if (!sesi || !semester) {
        return res.status(400).json({ 
          error: 'Missing sesi or semester parameters' 
        });
      }

      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      const courseStats = await analysisSvc.getCourseStatistics(sesi, semester, loginSessionId, adminSessionId);
      res.json({
        success: true,
        data: courseStats,
        message: `Found ${courseStats.length} courses with registered students`,
        count: courseStats.length
      });

    } catch (error) {
      console.error('[AnalysisController] getCourseStatistics error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch course statistics',
        details: error.message 
      });
    }
  },

  /**
   * GET /api/analysis/courses/top-courses
   * Get top courses with registered students
   */
  async getTopCourses(req, res) {
    try {
      const { sesi, semester, loginSessionId, adminSessionId, limit = 10 } = req.query;
      
      if (!sesi || !semester) {
        return res.status(400).json({ 
          error: 'Missing sesi or semester parameters' 
        });
      }

      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      const topCourses = await analysisSvc.getTopCourses(sesi, semester, loginSessionId, adminSessionId, parseInt(limit));
      res.json({
        success: true,
        data: topCourses,
        message: 'Top courses retrieved successfully'
      });

    } catch (error) {
      console.error('[AnalysisController] getTopCourses error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch top courses',
        details: error.message 
      });
    }
  },

  /**
   * GET /api/analysis/courses/top-sections
   * Get top sections with registered students
   */
  async getTopSections(req, res) {
    try {
      const { sesi, semester, loginSessionId, adminSessionId, limit = 10 } = req.query;
      
      if (!sesi || !semester) {
        return res.status(400).json({ 
          error: 'Missing sesi or semester parameters' 
        });
      }

      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      const topSections = await analysisSvc.getTopSections(sesi, semester, loginSessionId, adminSessionId, parseInt(limit));
      res.json({
        success: true,
        data: topSections,
        message: 'Top sections retrieved successfully'
      });

    } catch (error) {
      console.error('[AnalysisController] getTopSections error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch top sections',
        details: error.message 
      });
    }
  },

  /**
   * GET /api/analysis/courses/conflicts
   * Check for course conflicts
   */
  async checkCourseConflicts(req, res) {
    try {
      const { sesi, semester, loginSessionId, adminSessionId } = req.query;
      
      if (!sesi || !semester) {
        return res.status(400).json({ 
          error: 'Missing sesi or semester parameters' 
        });
      }

      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      const conflicts = await analysisSvc.checkCourseConflicts(sesi, semester, loginSessionId, adminSessionId);
      res.json({
        success: true,
        data: conflicts,
        message: `Found ${conflicts.length} course conflicts`,
        count: conflicts.length
      });

    } catch (error) {
      console.error('[AnalysisController] checkCourseConflicts error:', error);
      res.status(500).json({ 
        error: 'Failed to check course conflicts',
        details: error.message 
      });
    }
  },

  // ============================================================================
  // ROOM ANALYSIS ENDPOINTS
  // ============================================================================

  /**
   * GET /api/analysis/rooms/clashes
   * Check for room clashes
   */
  async checkRoomClashes(req, res) {
    try {
      const { sesi, semester, loginSessionId, adminSessionId } = req.query;
      
      if (!sesi || !semester) {
        return res.status(400).json({ 
          error: 'Missing sesi or semester parameters' 
        });
      }

      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      const clashes = await analysisSvc.checkRoomClashes(sesi, semester, loginSessionId, adminSessionId);
      res.json({
        success: true,
        data: clashes,
        message: `Found ${clashes.length} room clashes`,
        count: clashes.length
      });

    } catch (error) {
      console.error('[AnalysisController] checkRoomClashes error:', error);
      res.status(500).json({ 
        error: 'Failed to check room clashes',
        details: error.message 
      });
    }
  },

  /**
   * GET /api/analysis/rooms/utilization
   * Get room utilization statistics
   */
  async getRoomUtilization(req, res) {
    try {
      const { sesi, semester, loginSessionId, adminSessionId } = req.query;
      
      if (!sesi || !semester) {
        return res.status(400).json({ 
          error: 'Missing sesi or semester parameters' 
        });
      }

      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      const utilization = await analysisSvc.getRoomUtilization(sesi, semester, loginSessionId, adminSessionId);
      res.json({
        success: true,
        data: utilization,
        message: 'Room utilization statistics retrieved successfully'
      });

    } catch (error) {
      console.error('[AnalysisController] getRoomUtilization error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch room utilization',
        details: error.message 
      });
    }
  },

  // ============================================================================
  // GENERAL ANALYSIS ENDPOINTS
  // ============================================================================

  /**
   * GET /api/analysis/overview
   * Get comprehensive system overview
   */
  async getSystemOverview(req, res) {
    try {
      const { sesi, semester, loginSessionId, adminSessionId } = req.query;
      
      if (!sesi || !semester) {
        return res.status(400).json({ 
          error: 'Missing sesi or semester parameters' 
        });
      }

      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      const overview = await analysisSvc.getSystemOverview(sesi, semester, loginSessionId, adminSessionId);
      res.json({
        success: true,
        data: overview,
        message: 'System overview retrieved successfully'
      });

    } catch (error) {
      console.error('[AnalysisController] getSystemOverview error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch system overview',
        details: error.message 
      });
    }
  },

  // ============================================================================
  // BULK ANALYSIS ENDPOINTS
  // ============================================================================

  /**
   * GET /api/analysis/bulk
   * Get multiple analysis reports in one request
   */
  async getBulkAnalysis(req, res) {
    try {
      const { sesi, semester, loginSessionId, adminSessionId, reports = [] } = req.query;
      
      if (!sesi || !semester) {
        return res.status(400).json({ 
          error: 'Missing sesi or semester parameters' 
        });
      }

      if (!loginSessionId && !adminSessionId) {
        return res.status(400).json({ 
          error: 'Missing loginSessionId or adminSessionId' 
        });
      }

      const availableReports = [
        'students-over-years',
        'lecturer-workload',
        'top-lecturers',
        'lecturer-conflicts',
        'section-statistics',
        'top-sections',
        'course-conflicts',
        'room-clashes',
        'room-utilization',
        'system-overview'
      ];

      const requestedReports = reports.length > 0 ? reports : availableReports;
      const results = {};

      for (const report of requestedReports) {
        try {
          switch (report) {
            case 'students-over-years':
              results[report] = await analysisSvc.getStudentsOverYears(loginSessionId, adminSessionId);
              break;
            case 'lecturer-workload':
              results[report] = await analysisSvc.getLecturerWorkload(sesi, semester, loginSessionId, adminSessionId);
              break;
            case 'top-lecturers':
              results[report] = await analysisSvc.getTopLecturers(sesi, semester, loginSessionId, adminSessionId);
              break;
            case 'lecturer-conflicts':
              results[report] = await analysisSvc.checkLecturerConflicts(sesi, semester, loginSessionId, adminSessionId);
              break;
            case 'section-statistics':
              results[report] = await analysisSvc.getSectionStatistics(sesi, semester, loginSessionId, adminSessionId);
              break;
            case 'top-sections':
              results[report] = await analysisSvc.getTopSections(sesi, semester, loginSessionId, adminSessionId);
              break;
            case 'course-conflicts':
              results[report] = await analysisSvc.checkCourseConflicts(sesi, semester, loginSessionId, adminSessionId);
              break;
            case 'room-clashes':
              results[report] = await analysisSvc.checkRoomClashes(sesi, semester, loginSessionId, adminSessionId);
              break;
            case 'room-utilization':
              results[report] = await analysisSvc.getRoomUtilization(sesi, semester, loginSessionId, adminSessionId);
              break;
            case 'system-overview':
              results[report] = await analysisSvc.getSystemOverview(sesi, semester, loginSessionId, adminSessionId);
              break;
            default:
              results[report] = { error: `Unknown report type: ${report}` };
          }
        } catch (error) {
          results[report] = { error: error.message };
        }
      }

      res.json({
        success: true,
        data: results,
        message: 'Bulk analysis completed',
        period: { sesi, semester }
      });

    } catch (error) {
      console.error('[AnalysisController] getBulkAnalysis error:', error);
      res.status(500).json({ 
        error: 'Failed to perform bulk analysis',
        details: error.message 
      });
    }
  }
};
