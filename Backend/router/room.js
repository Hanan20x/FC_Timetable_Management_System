// routers/room.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/roomController');

// List & filter rooms
router.get('/',               ctrl.listAll);
router.get('/filter/name',    ctrl.filterByName);
router.get('/filter/code',    ctrl.filterByCode);

// Room schedule & timetable
router.get('/schedule/:roomCode/:sesi/:semester',         ctrl.getSchedule);
router.get('/timetable/:roomCode/:sesi/:semester',        ctrl.getTimetable);
router.get('/timetable/:roomCode/:sesi/:semester/:day',   ctrl.getDailyTimetable);

// Availability
router.get('/availability/:roomCode', ctrl.getAvailability);

module.exports = router;
