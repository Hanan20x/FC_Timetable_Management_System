import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import ProfileView from '@/views/ProfileView.vue'
import DashboardView from '@/views/DashboardView.vue'
import TimetableView from '@/views/TimetableView.vue'
import MoreView from '@/views/MoreView.vue'
import LecturerScheduleView from '@/views/LecturerScheduleView.vue'
import StudentsBySectionView from '@/views/StudentsBySectionView.vue'
import RoomAvailabilityView from '@/views/RoomAvailabilityView.vue'
import MyCourses from '@/views/mycourses.vue'
import FacultyCoursesView from '@/views/FacultyCoursesView.vue'
import AnalysisView  from '@/views/AnalysisView.vue'

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/profile', name: 'Profile', component: ProfileView },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/timetable', name: 'Timetable', component: TimetableView },
  { path: '/more', name: 'More', component: MoreView },
  { path: '/lecturer-schedule', name: 'LecturerSchedule', component: LecturerScheduleView },
  { path: '/students-by-section', name: 'StudentsBySection', component: StudentsBySectionView },
  { path: '/room-availability', name: 'RoomAvailability', component: RoomAvailabilityView },
  { path: '/mycourses', name: 'MyCourses', component: MyCourses },
  { path: '/facultycourses', name: 'FacultyCourses', component: FacultyCoursesView },
  { path: '/analytics', name: 'analytics', component: AnalysisView }
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
