// routers/lecturer.js
const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturerController');

// Get all lecturers
router.get('/', lecturerController.listAll);

// Get lecturer courses
router.get('/courses/:staffNo/:session/:semester', lecturerController.getCourses);

// Get timetable
router.get('/timetable/:staffNo/:session/:semester', lecturerController.getTimetable);

// Filters
router.get('/filter/name', lecturerController.filterByName);
router.get('/filter/staff', lecturerController.filterByStaffNo);

module.exports = router;


/*


# Get all lecturers
curl "http://localhost:3000/api/lecturer?adminSessionId=266340430139829&sesi=2024/2025&semester=2"

# Filter by name
curl "http://localhost:3000/api/lecturer/filter/name?query=ali&adminSessionId=..."

# Filter by staff number
curl "http://localhost:3000/api/lecturer/filter/staff?partial=12345&adminSessionId=..."

# Get courses
curl "http://localhost:3000/api/lecturer/courses/12345/2024/2025/2"

# Get timetable
curl "http://localhost:3000/api/lecturer/timetable/12345/2024/2025/2"


*/