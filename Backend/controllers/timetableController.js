const svc = require('../services/timetableService');

module.exports = {
  getAllSessions:    async (req, res) => {
    try { res.json(await svc.fetchAllSessions()); }
    catch(e){ res.status(500).json({ error:'Failed to fetch all sessions' }); }
  },

  getCurrentPeriod:  async (req, res) => {
    try { res.json(await svc.fetchCurrentPeriod()); }
    catch(e){ res.status(500).json({ error:'Failed to fetch current period' }); }
  }
};
