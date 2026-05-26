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
        <h1 class="text-xl font-semibold text-gray-800">Room Availability</h1>
        <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
          <img src="@/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full" />
        </div>
      </header>

      <main class="p-4 sm:p-6 bg-white flex-1">
        <!-- Session/Semester Selection -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 class="text-lg font-medium mb-4 text-gray-800">Select Academic Period & Faculty</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label for="sessionSelect" class="block text-sm font-medium text-gray-700 mb-2">
                Academic Session
              </label>
              <select
                id="sessionSelect"
                v-model="selectedSession"
                @change="onSessionChange"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="loadingSessions"
              >
                <option value="">Select Session</option>
                <option
                  v-for="session in availableSessions"
                  :key="session"
                  :value="session"
                >
                  {{ session }} {{ session === currentSession ? '(Current)' : '' }}
                </option>
              </select>
            </div>
            
            <div>
              <label for="semesterSelect" class="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                id="semesterSelect"
                v-model="selectedSemester"
                @change="onSemesterChange"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="!selectedSession || loadingSemesters"
              >
                <option value="">Select Semester</option>
                <option
                  v-for="semester in availableSemesters"
                  :key="semester"
                  :value="semester"
                >
                  Semester {{ semester }}
                </option>
              </select>
            </div>

            <div>
              <label for="facultySelect" class="block text-sm font-medium text-gray-700 mb-2">
                Faculty
              </label>
              <select
                id="facultySelect"
                v-model="selectedFaculty"
                @change="onFacultyChange"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Faculty</option>
                <option value="FSKSM">FSKSM</option>
                <option value="FKE">FKE</option>
                <option value="FKA">FKA</option>
                <option value="FKM">FKM</option>
                <option value="FPREE">FPREE</option>
              </select>
            </div>
            
            <div>
              <button
                @click="loadRooms"
                :disabled="!selectedSession || !selectedSemester || !selectedFaculty || loading"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {{ loading ? 'Loading...' : 'Load Rooms' }}
              </button>
            </div>
          </div>
          
          <!-- Current Selection Display -->
          <div v-if="selectedSession && selectedSemester && selectedFaculty" class="mt-4 p-3 bg-blue-50 rounded-md">
            <p class="text-sm text-blue-800">
              <span class="font-medium">Viewing:</span> 
              {{ selectedFaculty }} Rooms - Session {{ selectedSession }}, Semester {{ selectedSemester }}
              <span v-if="selectedSession === currentSession && selectedSemester === currentSemester" class="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Current Period
              </span>
            </p>
          </div>
        </div>

        <!-- Search and Filter -->
        <div v-if="rooms.length > 0" class="mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div class="relative flex-grow mb-2 md:mb-0">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search rooms by name or code..."
                class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div class="flex space-x-2">
              <select
                v-model="filterAvailability"
                class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Rooms</option>
                <option value="available">Available Now</option>
                <option value="occupied">Currently Occupied</option>
              </select>
              <button
                @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
              >
                {{ viewMode === 'grid' ? 'List View' : 'Grid View' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-8">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>

        <!-- Summary Stats -->
        <div v-else-if="rooms.length > 0" class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-blue-100 rounded-lg p-4">
              <h3 class="text-center font-medium mb-2">Total Rooms</h3>
              <p class="text-2xl font-bold text-center text-blue-600">{{ filteredRooms.length }}</p>
            </div>
            <div class="bg-green-100 rounded-lg p-4">
              <h3 class="text-center font-medium mb-2">Available Now</h3>
              <p class="text-2xl font-bold text-center text-green-600">{{ availableNowCount }}</p>
            </div>
            <div class="bg-red-100 rounded-lg p-4">
              <h3 class="text-center font-medium mb-2">Currently Occupied</h3>
              <p class="text-2xl font-bold text-center text-red-600">{{ occupiedNowCount }}</p>
            </div>
            <div class="bg-yellow-100 rounded-lg p-4">
              <h3 class="text-center font-medium mb-2">With Schedules</h3>
              <p class="text-2xl font-bold text-center text-yellow-600">{{ roomsWithScheduleCount }}</p>
            </div>
          </div>
        </div>

        <!-- Rooms Display -->
        <div v-if="filteredRooms.length > 0">
          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="room in filteredRooms" 
              :key="room.kod_ruang"
              class="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow"
            >
              <!-- Room Header -->
              <div class="p-4 border-b">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">{{ room.nama_ruang_singkatan || room.kod_ruang }}</h3>
                    <p class="text-sm text-gray-600">{{ room.nama_ruang || 'No description' }}</p>
                    <p class="text-xs text-blue-600">{{ room.kod_ruang }}</p>
                  </div>
                  <div class="flex flex-col items-end">
                    <span 
                      :class="[
                        'px-2 py-1 text-xs rounded-full',
                        getRoomAvailabilityStatus(room.kod_ruang) === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ getRoomAvailabilityStatus(room.kod_ruang) === 'available' ? 'Available' : 'Occupied' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Room Schedule Toggle -->
              <div class="p-4">
                <button
                  @click="toggleRoomSchedule(room.kod_ruang)"
                  :disabled="loadingSchedules === room.kod_ruang"
                  class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <svg v-if="loadingSchedules === room.kod_ruang" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ expandedRooms[room.kod_ruang] ? 'Hide' : 'Show' }} Schedule</span>
                </button>

                <!-- Room Schedule Display -->
                <div v-if="expandedRooms[room.kod_ruang] && roomSchedules[room.kod_ruang]" class="mt-4">
                  <h4 class="font-medium text-gray-700 mb-3">Weekly Schedule</h4>
                  
                  <!-- Today's Schedule -->
                  <div class="mb-4">
                    <h5 class="text-sm font-medium text-gray-600 mb-2">Today ({{ todayName }})</h5>
                    <div v-if="getTodaySchedule(room.kod_ruang).length > 0" class="space-y-2">
                      <div 
                        v-for="slot in getTodaySchedule(room.kod_ruang)" 
                        :key="slot.time"
                        :class="[
                          'p-2 rounded text-sm',
                          slot.isCurrentTime ? 'bg-red-100 border border-red-300' : 'bg-gray-100'
                        ]"
                      >
                        <div class="flex justify-between items-center">
                          <span class="font-medium">{{ slot.time }}</span>
                          <span v-if="slot.isCurrentTime" class="text-red-600 text-xs font-bold">ONGOING</span>
                        </div>
                        <div class="text-gray-600">{{ slot.subject || 'Occupied' }}</div>
                      </div>
                    </div>
                    <p v-else class="text-sm text-green-600">Available all day</p>
                  </div>

                  <!-- Full Week Toggle -->
                  <button
                    @click="toggleFullWeekSchedule(room.kod_ruang)"
                    class="text-sm text-blue-600 hover:text-blue-800 mb-2"
                  >
                    {{ showFullWeek[room.kod_ruang] ? 'Hide' : 'Show' }} Full Week
                  </button>

                  <!-- Full Week Schedule -->
                  <div v-if="showFullWeek[room.kod_ruang]" class="mt-2">
                    <div class="overflow-x-auto">
                      <table class="min-w-full text-xs">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-2 py-1 text-left">Time</th>
                            <th v-for="day in displayDays" :key="day" class="px-2 py-1 text-center">{{ day }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="slot in timeSlots" :key="slot.key">
                            <td class="px-2 py-1 font-medium">{{ slot.label }}</td>
                            <td v-for="day in displayDays" :key="day" class="px-2 py-1 text-center">
                              <div 
                                v-if="roomTimetables[room.kod_ruang] && roomTimetables[room.kod_ruang][day] && roomTimetables[room.kod_ruang][day][slot.key]"
                                class="w-3 h-3 bg-red-400 rounded mx-auto"
                                :title="roomTimetables[room.kod_ruang][day][slot.key].subject || 'Occupied'"
                              ></div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="space-y-4">
            <div 
              v-for="room in filteredRooms" 
              :key="room.kod_ruang"
              class="bg-white rounded-lg shadow-md border"
            >
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold text-gray-800 mb-1">
                      {{ room.nama_ruang_singkatan || room.kod_ruang }}
                    </h3>
                    <p class="text-gray-600 mb-1">{{ room.nama_ruang || 'No description' }}</p>
                    <p class="text-sm text-blue-600">Code: {{ room.kod_ruang }}</p>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span 
                      :class="[
                        'px-3 py-1 text-sm rounded-full font-medium',
                        getRoomAvailabilityStatus(room.kod_ruang) === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ getRoomAvailabilityStatus(room.kod_ruang) === 'available' ? 'Available Now' : 'Currently Occupied' }}
                    </span>
                    <button
                      @click="toggleRoomSchedule(room.kod_ruang)"
                      :disabled="loadingSchedules === room.kod_ruang"
                      class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <svg v-if="loadingSchedules === room.kod_ruang" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{{ expandedRooms[room.kod_ruang] ? 'Hide' : 'View' }} Schedule</span>
                    </button>
                  </div>
                </div>

                <!-- Expanded Schedule (same as grid view) -->
                <div v-if="expandedRooms[room.kod_ruang] && roomSchedules[room.kod_ruang]" class="mt-6 pt-4 border-t">
                  <!-- Same schedule content as grid view -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Today's Schedule -->
                    <div>
                      <h4 class="font-medium text-gray-700 mb-3">Today ({{ todayName }})</h4>
                      <div v-if="getTodaySchedule(room.kod_ruang).length > 0" class="space-y-2">
                        <div 
                          v-for="slot in getTodaySchedule(room.kod_ruang)" 
                          :key="slot.time"
                          :class="[
                            'p-3 rounded',
                            slot.isCurrentTime ? 'bg-red-100 border border-red-300' : 'bg-gray-100'
                          ]"
                        >
                          <div class="flex justify-between items-center">
                            <span class="font-medium">{{ slot.time }}</span>
                            <span v-if="slot.isCurrentTime" class="text-red-600 text-sm font-bold">ONGOING</span>
                          </div>
                          <div class="text-gray-600">{{ slot.subject || 'Occupied' }}</div>
                        </div>
                      </div>
                      <p v-else class="text-green-600">Available all day</p>
                    </div>

                    <!-- Next Available -->
                    <div>
                      <h4 class="font-medium text-gray-700 mb-3">Next Available</h4>
                      <div class="p-3 bg-green-50 rounded">
                        <p class="text-green-700">{{ getNextAvailableTime(room.kod_ruang) }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Full Week Schedule Toggle -->
                  <div class="mt-4">
                    <button
                      @click="toggleFullWeekSchedule(room.kod_ruang)"
                      class="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {{ showFullWeek[room.kod_ruang] ? 'Hide' : 'Show' }} Full Week Schedule
                    </button>

                    <div v-if="showFullWeek[room.kod_ruang]" class="mt-4 overflow-x-auto">
                      <table class="min-w-full border border-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-4 py-2 text-left border-b">Time</th>
                            <th v-for="day in displayDays" :key="day" class="px-4 py-2 text-center border-b">{{ day }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="slot in timeSlots" :key="slot.key">
                            <td class="px-4 py-2 font-medium border-b">{{ slot.label }}</td>
                            <td v-for="day in displayDays" :key="day" class="px-4 py-2 text-center border-b">
                              <div 
                                v-if="roomTimetables[room.kod_ruang] && roomTimetables[room.kod_ruang][day] && roomTimetables[room.kod_ruang][day][slot.key]"
                                class="w-full p-2 bg-red-100 text-red-800 rounded text-xs"
                                :title="roomTimetables[room.kod_ruang][day][slot.key].subject || 'Occupied'"
                              >
                                {{ roomTimetables[room.kod_ruang][day][slot.key].subject || 'Occupied' }}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Rooms Found -->
        <div v-else-if="!loading && selectedFaculty" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Rooms Found</h3>
          <p class="text-gray-500">
            No rooms found for {{ selectedFaculty }} in Session {{ selectedSession }}, Semester {{ selectedSemester }}
          </p>
        </div>

        <!-- Initial State -->
        <div v-else-if="!loading" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Room Availability</h3>
          <p class="text-gray-500">
            Select a session, semester, and faculty to view room availability
          </p>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'RoomAvailabilityView',
  components: { Sidebar },
  setup() {
    const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi'
    
    const sidebarOpen = ref(false)
    const loading = ref(false)
    const loadingSchedules = ref(null)
    const loadingSessions = ref(false)
    const loadingSemesters = ref(false)
    
    // Selection states
    const selectedSession = ref('')
    const selectedSemester = ref('')
    const selectedFaculty = ref('FSKSM') // Default to FSKSM as mentioned
    const currentSession = ref('')
    const currentSemester = ref('')
    
    // Data arrays
    const availableSessions = ref([])
    const availableSemesters = ref([])
    const rooms = ref([])
    const roomSchedules = ref({})
    const roomTimetables = ref({})
    
    // UI states
    const searchQuery = ref('')
    const filterAvailability = ref('')
    const viewMode = ref('grid')
    const expandedRooms = ref({})
    const showFullWeek = ref({})
    
    // Time and date utilities
    const now = new Date()
    const todayJsDay = now.getDay()
    const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][todayJsDay]
    const currentHour = now.getHours() + now.getMinutes() / 60
    
    // Time slots and days (same as other views)
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
    
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const displayDays = computed(() =>
      days.filter(d => ['MON', 'TUE', 'WED', 'THU', 'FRI'].includes(d))
    )
    
    const dayMap = { 1: 'SUN', 2: 'MON', 3: 'TUE', 4: 'WED', 5: 'THU', 6: 'FRI', 7: 'SAT' }
    
    // API functions
    async function fetchJSON(params) {
      const url = `${TTMS_API}?${new URLSearchParams(params)}`
      console.log('[RoomAvailability] Fetching:', url)
      const res = await fetch(url)
      const json = await res.json()
      console.log('[RoomAvailability] Response for', params.entity, json)
      return json
    }
    
    async function loadCurrentPeriod() {
      try {
        const sessionCacheKey = 'current_session'
        const cachedSession = localStorage.getItem(sessionCacheKey)
        
        let sesData
        if (cachedSession) {
          sesData = JSON.parse(cachedSession)
          console.log('[RoomAvailability] Using cached session data:', sesData)
        } else {
          const [sessionResponse] = await fetchJSON({ entity: 'sesisemester' })
          sesData = sessionResponse
          localStorage.setItem(sessionCacheKey, JSON.stringify(sesData))
          console.log('[RoomAvailability] Fetched and cached session data:', sesData)
        }
        
        currentSession.value = sesData.sesi
        currentSemester.value = sesData.semester
        selectedSession.value = currentSession.value
        selectedSemester.value = currentSemester.value
        
        console.log('[RoomAvailability] Current period set:', currentSession.value, currentSemester.value)
      } catch (err) {
        console.error('[RoomAvailability] Error loading current period:', err)
      }
    }
    
    async function loadAvailableSessions() {
      loadingSessions.value = true
      try {
        const currentYear = new Date().getFullYear()
        const sessions = [
          `${currentYear}/${currentYear + 1}`,
          `${currentYear - 1}/${currentYear}`,
          `${currentYear - 2}/${currentYear - 1}`
        ]
        
        availableSessions.value = sessions
        console.log('[RoomAvailability] Available sessions:', sessions)
      } catch (err) {
        console.error('[RoomAvailability] Error loading sessions:', err)
        availableSessions.value = [currentSession.value]
      } finally {
        loadingSessions.value = false
      }
    }
    
    async function loadAvailableSemesters() {
      if (!selectedSession.value) return
      
      loadingSemesters.value = true
      try {
        availableSemesters.value = [1, 2]
        console.log('[RoomAvailability] Available semesters:', [1, 2])
      } catch (err) {
        console.error('[RoomAvailability] Error loading semesters:', err)
        availableSemesters.value = [1, 2]
      } finally {
        loadingSemesters.value = false
      }
    }
    
    async function loadRooms() {
      if (!selectedSession.value || !selectedSemester.value || !selectedFaculty.value) return
      
      loading.value = true
      console.log('[RoomAvailability] Loading rooms for:', {
        session: selectedSession.value,
        semester: selectedSemester.value,
        faculty: selectedFaculty.value
      })
      
      try {
        const cacheKey = `rooms_${selectedFaculty.value}_${selectedSession.value}_${selectedSemester.value}`
        const cached = localStorage.getItem(cacheKey)
        
        if (cached) {
          const cachedData = JSON.parse(cached)
          const cacheAge = Date.now() - (cachedData.timestamp || 0)
          const cacheMaxAge = 30 * 60 * 1000 // 30 minutes
          
          if (cacheAge < cacheMaxAge) {
            rooms.value = cachedData.rooms
            console.log('[RoomAvailability] Loaded rooms from cache:', rooms.value.length)
            return
          }
        }
        
        // Fetch rooms using the ruang API
        const roomsData = await fetchJSON({
          entity: 'ruang',
          kod_fakulti: selectedFaculty.value
        })
        
        rooms.value = roomsData
        
        // Cache with timestamp
        const dataToCache = {
          rooms: roomsData,
          timestamp: Date.now()
        }
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache))
        
        console.log('[RoomAvailability] Successfully loaded', roomsData.length, 'rooms')
        
      } catch (err) {
        console.error('[RoomAvailability] Error loading rooms:', err)
        rooms.value = []
      } finally {
        loading.value = false
      }
    }
    
    async function toggleRoomSchedule(roomCode) {
      if (expandedRooms.value[roomCode]) {
        expandedRooms.value[roomCode] = false
        return
      }
      
      if (roomSchedules.value[roomCode]) {
        expandedRooms.value[roomCode] = true
        return
      }
      
      loadingSchedules.value = roomCode
      console.log('[RoomAvailability] Loading schedule for room:', roomCode)
      
      try {
        const cacheKey = `room_schedule_${roomCode}_${selectedSession.value}_${selectedSemester.value}`
        const cached = localStorage.getItem(cacheKey)
        
        if (cached) {
          const cachedData = JSON.parse(cached)
          roomSchedules.value[roomCode] = cachedData.schedule
          roomTimetables.value[roomCode] = cachedData.timetable
          expandedRooms.value[roomCode] = true
          console.log('[RoomAvailability] Loaded schedule from cache for:', roomCode)
          return
        }
        
        // Fetch room schedule using jadual_ruang API
        const scheduleData = await fetchJSON({
          entity: 'jadual_ruang',
          sesi: selectedSession.value,
          semester: selectedSemester.value,
          kod_ruang: roomCode
        })
        
        // Process schedule data into timetable format
        const timetableData = {}
        const scheduleList = []
        
        for (const item of scheduleData) {
          const day = dayMap[item.hari]
          const slot = `${item.masa}`
          
          if (!timetableData[day]) timetableData[day] = {}
          timetableData[day][slot] = {
            subject: item.kod_subjek || 'Occupied',
            time: timeSlots.find(t => t.key === slot)?.label || `${item.masa}:00`
          }
          
          scheduleList.push({
            day: day,
            time: timeSlots.find(t => t.key === slot)?.label || `${item.masa}:00`,
            subject: item.kod_subjek || 'Occupied',
            slot: slot,
            hari: item.hari
          })
        }
        
        roomSchedules.value[roomCode] = scheduleList
        roomTimetables.value[roomCode] = timetableData
        
        // Cache the processed data
        const dataToCache = {
          schedule: scheduleList,
          timetable: timetableData,
          timestamp: Date.now()
        }
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache))
        
        expandedRooms.value[roomCode] = true
        console.log('[RoomAvailability] Successfully loaded schedule for:', roomCode)
        
      } catch (err) {
        console.error('[RoomAvailability] Error loading room schedule:', err)
        roomSchedules.value[roomCode] = []
        roomTimetables.value[roomCode] = {}
        expandedRooms.value[roomCode] = true
      } finally {
        loadingSchedules.value = null
      }
    }
    
    function toggleFullWeekSchedule(roomCode) {
      showFullWeek.value[roomCode] = !showFullWeek.value[roomCode]
    }
    
    // Utility functions
    function getRoomAvailabilityStatus(roomCode) {
      const schedule = roomSchedules.value[roomCode]
      if (!schedule) return 'available'
      
      const todaySchedule = schedule.filter(item => {
        const dayIndex = Object.keys(dayMap).find(key => dayMap[key] === todayName.toUpperCase().slice(0, 3))
        return item.hari === parseInt(dayIndex)
      })
      
      for (const slot of todaySchedule) {
        const slotHour = parseInt(slot.slot) + (slot.slot === '7' ? 5 : 0)
        const slotEndHour = slotHour + 0.83
        
        if (currentHour >= slotHour && currentHour <= slotEndHour) {
          return 'occupied'
        }
      }
      
      return 'available'
    }
    
    function getTodaySchedule(roomCode) {
      const schedule = roomSchedules.value[roomCode]
      if (!schedule) return []
      
      const todaySchedule = schedule.filter(item => {
        const dayIndex = Object.keys(dayMap).find(key => dayMap[key] === todayName.toUpperCase().slice(0, 3))
        return item.hari === parseInt(dayIndex)
      })
      
      return todaySchedule.map(slot => {
        const slotHour = parseInt(slot.slot) + (slot.slot === '7' ? 5 : 0)
        const slotEndHour = slotHour + 0.83
        
        return {
          ...slot,
          isCurrentTime: currentHour >= slotHour && currentHour <= slotEndHour
        }
      }).sort((a, b) => parseInt(a.slot) - parseInt(b.slot))
    }
    
    function getNextAvailableTime(roomCode) {
      const todaySchedule = getTodaySchedule(roomCode)
      
      if (todaySchedule.length === 0) {
        return 'Available all day'
      }
      
      // Find next available slot
      for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i]
        const slotHour = parseInt(slot.key) + (slot.key === '7' ? 5 : 0)
        
        if (slotHour > currentHour) {
          const isOccupied = todaySchedule.some(s => s.slot === slot.key)
          if (!isOccupied) {
            return `Available from ${slot.label}`
          }
        }
      }
      
      return 'Available tomorrow'
    }
    
    // Event handlers
    function onSessionChange() {
      selectedSemester.value = ''
      availableSemesters.value = []
      rooms.value = []
      roomSchedules.value = {}
      roomTimetables.value = {}
      if (selectedSession.value) {
        loadAvailableSemesters()
      }
    }
    
    function onSemesterChange() {
      rooms.value = []
      roomSchedules.value = {}
      roomTimetables.value = {}
    }
    
    function onFacultyChange() {
      rooms.value = []
      roomSchedules.value = {}
      roomTimetables.value = {}
    }
    
    // Computed properties
    const filteredRooms = computed(() => {
      let filtered = rooms.value
      
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(room => 
          (room.nama_ruang && room.nama_ruang.toLowerCase().includes(query)) ||
          (room.nama_ruang_singkatan && room.nama_ruang_singkatan.toLowerCase().includes(query)) ||
          (room.kod_ruang && room.kod_ruang.toLowerCase().includes(query))
        )
      }
      
      // Apply availability filter
      if (filterAvailability.value) {
        filtered = filtered.filter(room => {
          const status = getRoomAvailabilityStatus(room.kod_ruang)
          return filterAvailability.value === status
        })
      }
      
      return filtered.sort((a, b) => {
        const nameA = a.nama_ruang_singkatan || a.kod_ruang || ''
        const nameB = b.nama_ruang_singkatan || b.kod_ruang || ''
        return nameA.localeCompare(nameB)
      })
    })
    
    const availableNowCount = computed(() => {
      return filteredRooms.value.filter(room => 
        getRoomAvailabilityStatus(room.kod_ruang) === 'available'
      ).length
    })
    
    const occupiedNowCount = computed(() => {
      return filteredRooms.value.filter(room => 
        getRoomAvailabilityStatus(room.kod_ruang) === 'occupied'
      ).length
    })
    
    const roomsWithScheduleCount = computed(() => {
      return Object.keys(roomSchedules.value).filter(roomCode => 
        roomSchedules.value[roomCode] && roomSchedules.value[roomCode].length > 0
      ).length
    })
    
    // Initialize
    async function initialize() {
      await loadCurrentPeriod()
      await loadAvailableSessions()
      if (selectedSession.value) {
        await loadAvailableSemesters()
      }
    }
    
    onMounted(initialize)
    
    return {
      sidebarOpen, loading, loadingSchedules, loadingSessions, loadingSemesters,
      selectedSession, selectedSemester, selectedFaculty,
      currentSession, currentSemester,
      availableSessions, availableSemesters,
      rooms, roomSchedules, roomTimetables,
      searchQuery, filterAvailability, viewMode,
      expandedRooms, showFullWeek,
      filteredRooms, availableNowCount, occupiedNowCount, roomsWithScheduleCount,
      displayDays, timeSlots, todayName,
      onSessionChange, onSemesterChange, onFacultyChange,
      loadRooms, toggleRoomSchedule, toggleFullWeekSchedule,
      getRoomAvailabilityStatus, getTodaySchedule, getNextAvailableTime
    }
  }
}
</script>

<style scoped>
.transition-shadow {
  transition: box-shadow 0.2s ease-in-out;
}

.transition-colors {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}
</style>
