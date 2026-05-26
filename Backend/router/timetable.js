const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/timetableController');

router.get('/sessions/all',       ctrl.getAllSessions);
router.get('/sessions/current',   ctrl.getCurrentPeriod);

module.exports = router;
