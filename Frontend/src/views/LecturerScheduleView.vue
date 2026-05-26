<template>
    <div class="relative min-h-screen bg-gray-50">
      <Sidebar :open="sidebarOpen" @update:open="val => sidebarOpen = val" />
  
      <div class="flex flex-col">
        <header class="flex items-center justify-between p-4 bg-white shadow">
          <button @click="sidebarOpen = true" class="p-2">
            <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="text-xl font-semibold text-gray-800">Lecturer Schedule</h1>
          <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
            <img src="@/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full" />
          </div>
        </header>
  
        <main class="p-4 sm:p-6 bg-white flex-1">
          <!-- Load Lecturers Button -->
          <div v-if="!lecturersLoaded" class="text-center py-12">
            <div class="mb-6">
              <svg class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-800 mb-2">Load Lecturers</h3>
              <p class="text-gray-600 mb-6">Click the button below to load lecturer information</p>
              <button
                @click="loadLecturers"
                :disabled="loading"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                <svg v-if="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{{ loading ? 'Loading...' : 'Load Lecturers' }}</span>
              </button>
            </div>
          </div>
  
          <!-- Lecturers List -->
          <div v-else>
            <!-- Search Bar -->
            <div class="mb-6">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search by lecturer name or staff number..."
                  class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
  
            <!-- Summary Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-blue-100 rounded-lg p-4">
                <h3 class="text-center font-medium mb-2">Total Lecturers</h3>
                <p class="text-2xl font-bold text-center text-blue-600">{{ filteredLecturers.length }}</p>
              </div>
              <div class="bg-green-100 rounded-lg p-4">
                <h3 class="text-center font-medium mb-2">Combined Students Count</h3>
                <p class="text-2xl font-bold text-center text-green-600">{{ totalStudents }}</p>
              </div>
              <div class="bg-yellow-100 rounded-lg p-4">
                <h3 class="text-center font-medium mb-2">Total Subjects</h3>
                <p class="text-2xl font-bold text-center text-yellow-600">{{ totalSubjects }}</p>
              </div>
              <div class="bg-purple-100 rounded-lg p-4">
                <h3 class="text-center font-medium mb-2">Total Sections</h3>
                <p class="text-2xl font-bold text-center text-purple-600">{{ totalSections }}</p>
              </div>
            </div>
  
            <!-- Lecturers List -->
            <div v-if="filteredLecturers.length > 0" class="space-y-4">
              <div 
                v-for="lecturer in filteredLecturers" 
                :key="lecturer.no_pekerja"
                class="bg-white rounded-lg shadow-md overflow-hidden border"
              >
                <!-- Lecturer Header -->
                <div 
                  @click="toggleLecturer(lecturer.no_pekerja)"
                  class="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-800">{{ lecturer.nama }}</h3>
                      <p class="text-sm text-gray-600">Staff No: {{ lecturer.no_pekerja }}</p>
                    </div>
                    <div class="flex items-center space-x-3">
                      <div class="text-right text-sm text-gray-600">
                        <div>{{ lecturer.bil_subjek }} subjects</div>
                        <div>{{ lecturer.bil_seksyen }} sections</div>
                      </div>
                      <!-- Chevron Icon -->
                      <svg 
                        :class="['w-5 h-5 text-gray-600 transition-transform', { 'rotate-180': expandedLecturers[lecturer.no_pekerja] }]"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
  
                <!-- Expanded Lecturer Details -->
                <div 
                  v-show="expandedLecturers[lecturer.no_pekerja]"
                  class="border-t bg-gray-50"
                >
                  <div class="px-6 py-4">
                    <!-- Stats Grid -->
                    <div class="grid grid-cols-3 gap-4 mb-4">
                      <div class="text-center p-3 bg-white rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">{{ lecturer.bil_subjek }}</div>
                        <div class="text-sm text-gray-600">Subjects</div>
                      </div>
                      <div class="text-center p-3 bg-white rounded-lg">
                        <div class="text-2xl font-bold text-green-600">{{ lecturer.bil_seksyen }}</div>
                        <div class="text-sm text-gray-600">Sections</div>
                      </div>
                      <div class="text-center p-3 bg-white rounded-lg">
                        <div class="text-2xl font-bold text-purple-600">{{ lecturer.bil_pelajar }}</div>
                        <div class="text-sm text-gray-600">Students</div>
                      </div>
                    </div>
  
                    <!-- View Sections Button -->
                    <div class="flex justify-center">
                      <button
                        @click="viewLecturerSections(lecturer)"
                        :disabled="loadingSections === lecturer.no_pekerja"
                        class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg v-if="loadingSections === lecturer.no_pekerja" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>{{ loadingSections === lecturer.no_pekerja ? 'Loading...' : 'View Sections' }}</span>
                      </button>
                    </div>
  
                    <!-- Sections Display with Color Coding -->
                    <div v-if="lecturerSections[lecturer.no_pekerja]" class="mt-4">
                      <div class="flex items-center justify-between mb-3">
                        <h4 class="font-medium text-gray-800">Teaching Sections:</h4>
                        <!-- View Schedule Button (appears after sections are loaded) -->
                        <button
                          @click="viewLecturerSchedule(lecturer)"
                          :disabled="loadingSchedule === lecturer.no_pekerja"
                          class="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg v-if="loadingSchedule === lecturer.no_pekerja" class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                          <svg v-else class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{{ loadingSchedule === lecturer.no_pekerja ? 'Loading...' : 'View Schedule' }}</span>
                        </button>
                      </div>
                      
                      <div class="space-y-2">
                        <div 
                          v-for="subject in lecturerSections[lecturer.no_pekerja]" 
                          :key="`${subject.kod_subjek}-${subject.seksyen}`"
                          class="p-3 bg-white rounded-lg border"
                        >
                          <div class="flex justify-between items-start">
                            <div class="flex items-start space-x-3">
                              <!-- Color Dot -->
                              <div 
                                class="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                                :style="{ backgroundColor: getSubjectColor(subject.kod_subjek) }"
                              ></div>
                              <div>
                                <h5 class="font-semibold text-gray-800">{{ subject.nama_subjek }}</h5>
                                <p class="text-sm text-gray-600">{{ subject.kod_subjek }} - Section {{ subject.seksyen }}</p>
                                <p class="text-xs text-gray-500">{{ subject.bil_pelajar }} students</p>
                              </div>
                            </div>
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {{ subject.kod_fakulti }}
                            </span>
                          </div>
                        </div>
                      </div>
  
                      <!-- Schedule Display (appears after clicking View Schedule) -->
                      <div v-if="lecturerSchedules[lecturer.no_pekerja]" class="mt-6 pt-4 border-t">
                        <div class="flex items-center justify-between mb-4">
                          <h4 class="font-medium text-gray-800 flex items-center">
                            <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Weekly Schedule
                          </h4>
                          <!-- View Mode Toggle -->
                          <button
                            @click="toggleScheduleView(lecturer.no_pekerja)"
                            class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            {{ scheduleViewMode[lecturer.no_pekerja] === 'grid' ? 'Switch to Daily View' : 'Switch to Grid View' }}
                          </button>
                        </div>
  
                        <!-- Grid View -->
                        <div v-if="scheduleViewMode[lecturer.no_pekerja] === 'grid'" class="bg-white rounded-lg border overflow-hidden">
                          <div class="overflow-x-auto">
                            <table class="min-w-full">
                              <thead class="bg-gray-50">
                                <tr>
                                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                  <th 
                                    v-for="day in displayDays" 
                                    :key="day"
                                    class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase"
                                  >
                                    {{ day }}
                                  </th>
                                </tr>
                              </thead>
                              <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="slot in timeSlots" :key="slot.key">
                                  <td class="px-3 py-2 text-sm text-gray-600 font-medium">{{ slot.label }}</td>
                                  <td 
                                    v-for="day in displayDays" 
                                    :key="day"
                                    class="px-3 py-2 text-center"
                                  >
                                    <div v-if="lecturerTimetable[lecturer.no_pekerja] && lecturerTimetable[lecturer.no_pekerja][day] && lecturerTimetable[lecturer.no_pekerja][day][slot.key]">
                                      <div 
                                        class="w-4 h-4 rounded mx-auto"
                                        :style="{ backgroundColor: getSubjectColor(lecturerTimetable[lecturer.no_pekerja][day][slot.key].subject) }"
                                        :title="`${lecturerTimetable[lecturer.no_pekerja][day][slot.key].subject} - ${lecturerTimetable[lecturer.no_pekerja][day][slot.key].venue}`"
                                      ></div>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
  
                        <!-- Daily View -->
                        <div v-else class="space-y-4">
                          <!-- Day selector -->
                          <div class="flex items-center space-x-2">
                            <label class="font-medium text-sm">Select Day:</label>
                            <select
                              v-model="selectedDay[lecturer.no_pekerja]"
                              class="border rounded px-2 py-1 text-sm"
                            >
                              <option
                                v-for="d in displayDays"
                                :key="d"
                                :value="d"
                              >
                                {{ d }}
                              </option>
                            </select>
                          </div>
  
                          <!-- Color-coded day banner -->
                          <div
                            class="p-2 rounded text-center font-semibold text-sm"
                            :class="dayColors[selectedDay[lecturer.no_pekerja]]"
                          >
                            {{ selectedDay[lecturer.no_pekerja] }}
                          </div>
  
                          <!-- List of classes for that day -->
                          <div v-if="lecturerTimetable[lecturer.no_pekerja] && lecturerTimetable[lecturer.no_pekerja][selectedDay[lecturer.no_pekerja]]">
                            <div
                              v-for="(cls, slot) in lecturerTimetable[lecturer.no_pekerja][selectedDay[lecturer.no_pekerja]]"
                              :key="slot"
                              class="flex items-center justify-between p-3 bg-gray-50 rounded border"
                            >
                              <div class="flex items-center space-x-3">
                                <div 
                                  class="w-4 h-4 rounded-full flex-shrink-0"
                                  :style="{ backgroundColor: getSubjectColor(cls.subject) }"
                                ></div>
                                <div>
                                  <p class="text-sm text-gray-600">{{ timeSlotsMap[slot] }}</p>
                                  <p class="font-medium">{{ cls.subject }}</p>
                                  <p class="text-xs text-gray-500">{{ cls.venue }}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p v-else class="text-center text-gray-500 text-sm py-4">
                            No classes on {{ selectedDay[lecturer.no_pekerja] }}.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- No Results -->
            <div v-else class="text-center py-12">
              <svg class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p class="text-gray-500 text-lg font-medium">No lecturers found</p>
              <p class="text-gray-400 mt-2">Try adjusting your search criteria</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  </template>
  
  <script>
  import Sidebar from '@/components/Sidebar.vue'
  import { ref, computed, onMounted } from 'vue'
  
  export default {
    name: 'LecturerScheduleView',
    components: { Sidebar },
    setup() {
      const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi'
      const ADMIN_AUTH_API = 'http://web.fc.utm.my/ttms/auth-admin.php'
      
      const sidebarOpen = ref(false)
      const loading = ref(false)
      const loadingSections = ref(null)
      const loadingSchedule = ref(null)
      const lecturersLoaded = ref(false)
      const lecturers = ref([])
      const searchQuery = ref('')
      const expandedLecturers = ref({})
      const lecturerSections = ref({})
      const lecturerSchedules = ref({})
      const lecturerTimetable = ref({})
      const scheduleViewMode = ref({})
      const selectedDay = ref({})
      const adminSessionId = ref('')
      const currentSession = ref({ sesi: '', semester: '' })
  
      // Color palette for subjects
      const subjectColors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
        '#14B8A6', '#F43F5E', '#8B5A2B', '#059669', '#7C3AED'
      ]
      const subjectColorMap = ref({})
  
      // Time slots and days (same as timetable view)
      const timeSlots = [
    { key: '2', label: '8:00 - 8:50' },
    { key: '3', label: '9:00 - 9:50' },
    { key: '4', label: '10:00 - 10:50' },
    { key: '5', label: '11:00 - 11:50' },
    { key: '6', label: '12:00 - 12:50' },
    { key: '7', label: '1:00 - 1:50' },
    { key: '8', label: '2:00 - 2:50' },
    { key: '9', label: '3:00 - 3:50' },
    { key: '10', label: '4:00 - 4:50' },
    { key: '11', label: '5:00 - 5:50' }
  ]
      const timeSlotsMap = timeSlots.reduce((m, s) => { m[s.key] = s.label; return m }, {})
  
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
      const displayDays = computed(() =>
        days.filter(d => ['MON', 'TUE', 'WED', 'THU', 'FRI'].includes(d))
      )
  
      const dayColors = {
        MON: 'bg-red-100 text-red-800',
        TUE: 'bg-yellow-100 text-yellow-800',
        WED: 'bg-green-100 text-green-800',
        THU: 'bg-blue-100 text-blue-800',
        FRI: 'bg-purple-100 text-purple-800'
      }
  
      const dayMap = { 1: 'SUN', 2: 'MON', 3: 'TUE', 4: 'WED', 5: 'THU', 6: 'FRI', 7: 'SAT' }
  
      function getSubjectColor(subjectCode) {
        if (!subjectColorMap.value[subjectCode]) {
          const colorIndex = Object.keys(subjectColorMap.value).length % subjectColors.length
          subjectColorMap.value[subjectCode] = subjectColors[colorIndex]
        }
        return subjectColorMap.value[subjectCode]
      }
  
      function toggleScheduleView(lecturerNo) {
        scheduleViewMode.value[lecturerNo] = scheduleViewMode.value[lecturerNo] === 'grid' ? 'daily' : 'grid'
      }
  
      async function fetchJSON(url) {
        console.log('[LecturerSchedule] Fetching:', url)
        const res = await fetch(url)
        const json = await res.json()
        console.log('[LecturerSchedule] Response:', json)
        return json
      }
  
      async function loadLecturers() {
        console.log('[LecturerSchedule] loadLecturers() start')
        loading.value = true
        
        try {
          const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession'))
          if (!loginData) {
            console.error('[LecturerSchedule] No login data')
            return
          }
  
          // Check for cached data first
          const cacheKey = `lecturers_${loginData.session_id}`
          const cached = localStorage.getItem(cacheKey)
          if (cached) {
            const cachedData = JSON.parse(cached)
            lecturers.value = cachedData.lecturers
            adminSessionId.value = cachedData.adminSessionId
            currentSession.value = cachedData.currentSession
            lecturersLoaded.value = true
            console.log('[LecturerSchedule] Loaded from cache')
            return
          }
  
          // Get current session (check cache first)
          let sesData
          const sessionCacheKey = 'current_session'
          const cachedSession = localStorage.getItem(sessionCacheKey)
          
          if (cachedSession) {
            sesData = JSON.parse(cachedSession)
            console.log('[LecturerSchedule] Using cached session data')
          } else {
            const sessionUrl = `${TTMS_API}?entity=sesisemester`
            const [sessionResponse] = await fetchJSON(sessionUrl)
            sesData = sessionResponse
            localStorage.setItem(sessionCacheKey, JSON.stringify(sesData))
            console.log('[LecturerSchedule] Fetched and cached session data')
          }
  
          currentSession.value = { sesi: sesData.sesi, semester: sesData.semester }
  
          // Get admin session ID
          const adminAuthUrl = `${ADMIN_AUTH_API}?session_id=${loginData.session_id}`
          const [adminAuth] = await fetchJSON(adminAuthUrl)
          adminSessionId.value = adminAuth.session_id
          console.log('[LecturerSchedule] Admin session ID:', adminSessionId.value)
  
          // Get lecturers list
          const lecturersUrl = `${TTMS_API}?entity=pensyarah&session_id=${adminSessionId.value}&sesi=${sesData.sesi}&semester=${sesData.semester}`
          const lecturersData = await fetchJSON(lecturersUrl)
          lecturers.value = lecturersData
  
          // Cache the data
          const dataToCache = {
            lecturers: lecturersData,
            adminSessionId: adminSessionId.value,
            currentSession: currentSession.value,
            timestamp: Date.now()
          }
          localStorage.setItem(cacheKey, JSON.stringify(dataToCache))
  
          lecturersLoaded.value = true
          console.log('[LecturerSchedule] Lecturers loaded:', lecturersData.length)
  
        } catch (err) {
          console.error('[LecturerSchedule] Error loading lecturers:', err)
        } finally {
          loading.value = false
        }
      }
  
      async function viewLecturerSections(lecturer) {
        console.log('[LecturerSchedule] Loading sections for:', lecturer.nama)
        loadingSections.value = lecturer.no_pekerja
  
        try {
          // Check cache first
          const sectionsCacheKey = `lecturer_sections_${lecturer.no_pekerja}`
          const cachedSections = localStorage.getItem(sectionsCacheKey)
          
          if (cachedSections) {
            lecturerSections.value[lecturer.no_pekerja] = JSON.parse(cachedSections)
            console.log('[LecturerSchedule] Loaded sections from cache')
            return
          }
  
          // Fetch lecturer subjects
          const sectionsUrl = `${TTMS_API}?entity=pensyarah_subjek&no_pekerja=${lecturer.no_pekerja}`
          const sectionsData = await fetchJSON(sectionsUrl)
          
          // Filter for current session
          const currentSections = sectionsData.filter(subject => 
            String(subject.sesi) === String(currentSession.value.sesi) &&
            String(subject.semester) === String(currentSession.value.semester)
          )
  
          lecturerSections.value[lecturer.no_pekerja] = currentSections
          
          // Cache the sections
          localStorage.setItem(sectionsCacheKey, JSON.stringify(currentSections))
          
          console.log('[LecturerSchedule] Sections loaded for', lecturer.nama, ':', currentSections.length, 'sections')
  
        } catch (err) {
          console.error('[LecturerSchedule] Error loading sections:', err)
        } finally {
          loadingSections.value = null
        }
      }
  
      async function viewLecturerSchedule(lecturer) {
        console.log('[LecturerSchedule] Loading detailed schedule for:', lecturer.nama)
        loadingSchedule.value = lecturer.no_pekerja
  
        try {
          // Initialize view mode and selected day
          scheduleViewMode.value[lecturer.no_pekerja] = 'grid'
          selectedDay.value[lecturer.no_pekerja] = displayDays.value[0]
  
          // Check cache first
          const timetableCacheKey = `lecturer_timetable_${lecturer.no_pekerja}`
          const cachedTimetable = localStorage.getItem(timetableCacheKey)
          
          if (cachedTimetable) {
            lecturerTimetable.value[lecturer.no_pekerja] = JSON.parse(cachedTimetable)
            lecturerSchedules.value[lecturer.no_pekerja] = { loaded: true }
            console.log('[LecturerSchedule] Loaded timetable from cache')
            return
          }
  
          // Build timetable from sections
          const sections = lecturerSections.value[lecturer.no_pekerja] || []
          const timetableData = {}
  
          for (const section of sections) {
            // Fetch schedule for each section
            const scheduleUrl = `${TTMS_API}?entity=jadual_subjek&sesi=${currentSession.value.sesi}&semester=${currentSession.value.semester}&kod_subjek=${section.kod_subjek}&seksyen=${section.seksyen}`
            const scheduleList = await fetchJSON(scheduleUrl)
  
            for (const item of scheduleList) {
              const day = dayMap[item.hari]
              const slot = `${item.masa}`
              
              if (!timetableData[day]) timetableData[day] = {}
              timetableData[day][slot] = {
                subject: section.kod_subjek,
                venue: item.ruang.nama_ruang_singkatan,
                section: section.seksyen
              }
            }
          }
  
          lecturerTimetable.value[lecturer.no_pekerja] = timetableData
          lecturerSchedules.value[lecturer.no_pekerja] = { loaded: true }
          
          // Cache the timetable
          localStorage.setItem(timetableCacheKey, JSON.stringify(timetableData))
          
          console.log('[LecturerSchedule] Timetable loaded for', lecturer.nama)
  
        } catch (err) {
          console.error('[LecturerSchedule] Error loading schedule:', err)
        } finally {
          loadingSchedule.value = null
        }
      }
  
      function toggleLecturer(no_pekerja) {
        expandedLecturers.value[no_pekerja] = !expandedLecturers.value[no_pekerja]
      }
  
      // Computed properties
      const filteredLecturers = computed(() => {
        if (!searchQuery.value) return lecturers.value
        
        const query = searchQuery.value.toLowerCase()
        return lecturers.value.filter(lecturer => 
          lecturer.nama.toLowerCase().includes(query) ||
          String(lecturer.no_pekerja).includes(query)
        )
      })
  
      const totalStudents = computed(() => {
        return filteredLecturers.value.reduce((sum, lecturer) => sum + lecturer.bil_pelajar, 0)
      })
  
      const totalSubjects = computed(() => {
        return filteredLecturers.value.reduce((sum, lecturer) => sum + lecturer.bil_subjek, 0)
      })
  
      const totalSections = computed(() => {
        return filteredLecturers.value.reduce((sum, lecturer) => sum + lecturer.bil_seksyen, 0)
      })
  
      // Check if data is already cached on mount
      onMounted(() => {
        const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession') || '{}')
        if (loginData.session_id) {
          const cacheKey = `lecturers_${loginData.session_id}`
          const cached = localStorage.getItem(cacheKey)
          if (cached) {
            const cachedData = JSON.parse(cached)
            lecturers.value = cachedData.lecturers
            adminSessionId.value = cachedData.adminSessionId
            currentSession.value = cachedData.currentSession
            lecturersLoaded.value = true
            console.log('[LecturerSchedule] Found cached data on mount')
          }
        }
      })
  
      return {
        sidebarOpen,
        loading,
        loadingSections,
        loadingSchedule,
        lecturersLoaded,
        lecturers,
        searchQuery,
        expandedLecturers,
        lecturerSections,
        lecturerSchedules,
        lecturerTimetable,
        scheduleViewMode,
        selectedDay,
        filteredLecturers,
        totalStudents,
        totalSubjects,
        totalSections,
        displayDays,
        timeSlots,
        timeSlotsMap,
        dayColors,
        loadLecturers,
        viewLecturerSections,
        viewLecturerSchedule,
        toggleLecturer,
        toggleScheduleView,
        getSubjectColor
      }
    }
  }
  </script>
  