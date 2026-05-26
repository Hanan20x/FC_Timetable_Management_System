# 📅 FC Timetable Management System

A mobile-friendly **Single Page Application (SPA)** for students and lecturers at the **Faculty of Computing, Universiti Teknologi Malaysia (UTM)** to access and manage academic timetables from any device.

> **Course**: Software Construction  
> **Lecturer**: Dr. Mohd Razak bin Samingan  
> **Group**: Delta

---

## 👥 Team Members

- Ahmad Muawya Sufyan Fakhruddin  
- Aqilla Noorshaumy  
- Esha Shuberthee  
- Mariam Hanif  
- Raghad Zeinalabdin Taha Osman  
- Chong Yaen Li  

---

## 🛠️ Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | **Vue 3** + **Vite** + TailwindCSS |
| Backend   | **Node.js** + **Express.js**       |
| Data      | UTM TTMS API (external)            |

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+  
- npm v9+  

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/FC_Timetable_Management_System.git
cd FC_Timetable_Management_System
```

### 2. Setup the Backend (Express.js Framework)

```bash
cd Backend
npm install
npm start
```

The backend server will start at: **http://localhost:3000**

Verify it's running:
```bash
curl http://localhost:3000/api/health
```

### 3. Setup the Frontend (Vue 3 + Vite Framework)

Open a **new terminal**:

```bash
cd Frontend
npm install
npm run dev
```

The frontend will be available at: **http://localhost:5173**

---

## 🌐 Five (5) Functionalities

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Login** | Authenticate as a student or lecturer using UTM credentials |
| 2 | **Student Timetable** | View full weekly class schedule for any student |
| 3 | **Lecturer Schedule** | View a lecturer's teaching timetable |
| 4 | **Room Availability** | Check which rooms are free or occupied |
| 5 | **Analysis Dashboard** | Charts and statistics on timetable utilization |

---

## 🔗 RESTful Web Services

This application exposes a RESTful API following REST architectural principles:
- **Stateless**: Each request contains all the information needed
- **Resource-based URLs**: Endpoints identify resources, not actions
- **HTTP verbs**: GET for retrieval, POST for creation
- **JSON responses**: All responses are JSON formatted

### ⭐ RESTful Web Service #1 — User Authentication

**Endpoint**: `POST /api/auth/login`

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "login": "A22EC0XXX",
  "password": "yourpassword"
}
```

**Response (200 OK)**:
```json
{
  "userSession": {
    "session_id": "...",
    "login": "A22EC0XXX",
    "user_id": "...",
    "session_expiry_time": "..."
  },
  "adminSession": {
    "session_id": "..."
  }
}
```

**Test with curl**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"A22EC0XXX","password":"yourpassword"}'
```

---

### ⭐ RESTful Web Service #2 — Student Timetable

**Endpoint**: `GET /api/student/timetable/full/:studentId/:session/:semester`

```http
GET http://localhost:3000/api/student/timetable/full/A22EC0001/2024%2F2025/2
```

**Response (200 OK)**:
```json
{
  "MON": {
    "1": { "subject": "SECJ3323", "section": "01", "venue": "N28a-02-02", "lecturer": "Dr. Ali" }
  },
  "TUE": {
    "3": { "subject": "SECJ3433", "section": "02", "venue": "BK-4", "lecturer": "Dr. Siti" }
  }
}
```

**Test with curl**:
```bash
curl "http://localhost:3000/api/student/timetable/full/A22EC0001/2024%2F2025/2"
```

---

### Other Available Endpoints

```
# Health check
GET  /api/health

# Auth
POST /api/auth/login                                    → Login (RESTful)
GET  /api/auth/login?login=A22XXX&password=xxx          → Login (legacy)

# Timetable sessions
GET  /api/timetable/sessions/all                        → All sessions
GET  /api/timetable/sessions/current                    → Current session

# Student
GET  /api/student/sessions/:studentId                   → Student sessions
GET  /api/student/courses/:id/:session/:semester        → Student courses
GET  /api/student/timetable/full/:id/:session/:semester → Full timetable ⭐
GET  /api/student/timetable/daily/:id/:session/:semester/:day → Daily timetable

# Lecturer
GET  /api/lecturer                                      → All lecturers
GET  /api/lecturer/timetable/:staffNo/:session/:semester → Lecturer timetable
GET  /api/lecturer/courses/:staffNo/:session/:semester  → Lecturer courses
GET  /api/lecturer/filter/name?query=Ali                → Search by name

# Room
GET  /api/room                                          → All rooms
GET  /api/room/availability/:roomCode                   → Room availability
GET  /api/room/timetable/:code/:sesi/:semester          → Room timetable
```

---

## 📁 Project Structure

```
FC_Timetable_Management_System/
├── Backend/                        # Express.js REST API
│   ├── app.js                      # Server entry point + middleware setup
│   ├── router/                     # Route definitions (RESTful endpoints)
│   │   ├── auth.js                 # POST /api/auth/login ⭐
│   │   ├── student.js              # GET /api/student/timetable/full/... ⭐
│   │   ├── lecturer.js
│   │   ├── room.js
│   │   ├── timetable.js
│   │   └── Analysis.js
│   ├── controllers/                # Business logic (MVC controller layer)
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── lecturerController.js
│   │   ├── roomController.js
│   │   ├── timetableController.js
│   │   └── AnalysisController.js
│   └── services/                   # Data fetching from TTMS API
│       ├── authService.js
│       ├── studentService.js
│       ├── lecturerService.js
│       ├── roomService.js
│       ├── timetableService.js
│       └── AnalysisService.js
│
└── Frontend/                       # Vue 3 + Vite SPA
    ├── index.html
    ├── vite.config.js              # Vite framework configuration
    ├── src/
    │   ├── main.js                 # Vue app entry point
    │   ├── App.vue                 # Root Vue component
    │   ├── router/                 # Vue Router (SPA navigation)
    │   ├── components/             # Reusable Vue components
    │   └── views/                  # Page views (one per functionality)
    │       ├── LoginView.vue       # Functionality 1: Login
    │       ├── TimetableView.vue   # Functionality 2: Student Timetable
    │       ├── LecturerScheduleView.vue  # Functionality 3: Lecturer Schedule
    │       ├── RoomAvailabilityView.vue  # Functionality 4: Room Availability
    │       └── AnalysisView.vue    # Functionality 5: Analysis Dashboard
    └── package.json
```

---

## 🎬 Video Demo Outline (< 2 minutes)

1. **Framework Setup** [0:00–0:30] — Show `npm install` + `npm run dev` for both Frontend and Backend
2. **RESTful Web Services** [0:30–1:10] — Demonstrate the 2 REST endpoints using Postman/browser
3. **Live Demo** [1:10–1:55] — Login → Student Timetable → Lecturer Schedule → Room Availability

---

## 📄 License

MIT License — Faculty of Computing, UTM