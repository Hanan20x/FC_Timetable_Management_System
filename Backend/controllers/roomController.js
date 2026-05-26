// controllers/roomController.js
const svc = require('../services/roomService');

module.exports = {
  // GET /api/room?adminSessionId=...&sesi=...&semester=...&faculty=FSKSM
  async listAll(req, res) {
    try {
      const { loginSessionId, adminSessionId, sesi, semester, faculty } = req.query;
      const rooms = await svc.fetchAllRooms({ loginSessionId, adminSessionId, sesi, semester, faculty });
      res.json(rooms);
    } catch (err) {
      console.error('[RoomController] listAll error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch rooms' });
    }
  },

  // GET /api/room/filter/name?query=...&adminSessionId=...&sesi=...&semester=...&faculty=...
  async filterByName(req, res) {
    try {
      const { query, ...ctx } = req.query;
      if (!query) return res.status(400).json({ error: 'Query is required' });
      const rooms = await svc.fetchAllRooms(ctx);
      res.json(svc.filterByName(rooms, query));
    } catch (err) {
      console.error('[RoomController] filterByName error:', err);
      res.status(500).json({ error: 'Failed to filter by name' });
    }
  },

  // GET /api/room/filter/code?code=...&adminSessionId=...
  async filterByCode(req, res) {
    try {
      const { code, ...ctx } = req.query;
      if (!code) return res.status(400).json({ error: 'Code is required' });
      const rooms = await svc.fetchAllRooms(ctx);
      res.json(svc.filterByCode(rooms, code));
    } catch (err) {
      console.error('[RoomController] filterByCode error:', err);
      res.status(500).json({ error: 'Failed to filter by code' });
    }
  },

  // GET /api/room/schedule/:roomCode/:sesi/:semester
  async getSchedule(req, res) {
    try {
      const { roomCode, sesi, semester } = req.params;
      const sched = await svc.fetchRoomSchedule({ roomCode, sesi, semester });
      res.json(sched);
    } catch (err) {
      console.error('[RoomController] getSchedule error:', err);
      res.status(500).json({ error: 'Failed to fetch room schedule' });
    }
  },

  // GET /api/room/timetable/:roomCode/:sesi/:semester
  async getTimetable(req, res) {
    try {
      const { roomCode, sesi, semester } = req.params;
      const tt = await svc.fetchRoomTimetable({ roomCode, sesi, semester });
      res.json(tt);
    } catch (err) {
      console.error('[RoomController] getTimetable error:', err);
      res.status(500).json({ error: 'Failed to fetch room timetable' });
    }
  },

  // GET /api/room/timetable/:roomCode/:sesi/:semester/:day
  async getDailyTimetable(req, res) {
    try {
      const { roomCode, sesi, semester, day } = req.params;
      const daily = await svc.fetchRoomDailyTimetable({ roomCode, sesi, semester, day });
      res.json(daily);
    } catch (err) {
      console.error('[RoomController] getDailyTimetable error:', err);
      res.status(400).json({ error: err.message || 'Failed to fetch daily timetable' });
    }
  },

  // GET /api/room/availability/:roomCode?adminSessionId=...&sesi=...&semester=...
  async getAvailability(req, res) {
    try {
      const { roomCode } = req.params;
      const { sesi, semester } = req.query;
      const tt = await svc.fetchRoomTimetable({ roomCode, sesi, semester });
      const status = svc.checkRoomAvailability(tt);
      res.json({ status });
    } catch (err) {
      console.error('[RoomController] getAvailability error:', err);
      res.status(500).json({ error: 'Failed to check availability' });
    }
  }
};
