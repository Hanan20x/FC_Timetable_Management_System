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
          <h1 class="text-xl font-semibold text-gray-800">Subject List</h1>
          <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
            <img src="@/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full" />
          </div>
        </header>
  
        <main class="p-4 sm:p-6 bg-white flex-1">
          <div v-if="loading" class="flex justify-center py-8">
            <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
  
          <div v-else>
            <!-- Summary Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="bg-blue-100 rounded-lg p-4">
                <h3 class="text-center font-medium mb-2">Total Subjects</h3>
                <p class="text-3xl font-bold text-center text-blue-600">{{ totalSubjects }}</p>
              </div>
              <div class="bg-green-100 rounded-lg p-4">
                <h3 class="text-center font-medium mb-2">Current Session</h3>
                <p class="text-3xl font-bold text-center text-green-600">{{ currentSessionSubjects }}</p>
              </div>
              <div class="bg-yellow-100 rounded-lg p-4">
                <h3 class="text-center font-medium mb-2">Electives</h3>
                <p class="text-3xl font-bold text-center text-yellow-600">{{ electiveSubjects }}</p>
              </div>
            </div>
  
            <!-- Subjects Grouped by Session -->
            <div v-if="Object.keys(groupedSubjects).length > 0" class="space-y-6">
              <div 
                v-for="sessionKey in sortedSessionKeys" 
                :key="sessionKey"
                class="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <!-- Collapsible Session Header -->
                <div 
                  @click="toggleSession(sessionKey)"
                  class="bg-gray-100 px-6 py-4 border-b cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-gray-800">
                      Session {{ sessionKey }}
                    </h2>
                    <div class="flex items-center space-x-3">
                      <span 
                        v-if="sessionKey === currentSessionKey"
                        class="px-3 py-1 bg-green-500 text-white text-sm rounded-full"
                      >
                        Current
                      </span>
                      <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {{ groupedSubjects[sessionKey].length }} 
                      </span>
                      <!-- Chevron Icon -->
                      <svg 
                        :class="['w-5 h-5 text-gray-600 transition-transform', { 'rotate-180': expandedSessions[sessionKey] }]"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
  
                <!-- Collapsible Subjects List -->
                <div 
                  v-show="expandedSessions[sessionKey]"
                  class="transition-all duration-300 ease-in-out"
                >
                  <div class="p-6">
                    <div class="grid gap-4">
                      <div 
                        v-for="subject in groupedSubjects[sessionKey]" 
                        :key="`${subject.kod_subjek}-${subject.seksyen}`"
                        class="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <!-- Main Subject Info -->
                        <div class="flex items-start justify-between mb-3">
                          <div class="flex-1">
                            <!-- Course Name (Main Title) -->
                            <h3 class="font-semibold text-lg text-gray-800 mb-1">
                              {{ subject.nama_subjek || subject.kod_subjek }}
                            </h3>
                            <!-- Subject Code -->
                            <p class="text-md text-gray-700 font-medium mb-1">
                              {{ subject.kod_subjek }}
                            </p>
                            <!-- Section -->
                            <p class="text-sm text-gray-500">
                              Section {{ subject.seksyen }}
                            </p>
                          </div>
                          <div class="flex flex-col items-end space-y-2">
                            <div class="flex space-x-2">
                              <span 
                                v-if="subject.kod_subjek.startsWith('U')"
                                class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                              >
                                Elective
                              </span>
                              <span 
                                v-if="subject.kredit"
                                class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                              >
                                {{ subject.kredit }} Credits
                              </span>
                            </div>
                            <!-- Schedule Toggle Button -->
                            <button
                              v-if="subject.schedule && subject.schedule.length > 0"
                              @click="toggleSchedule(`${subject.kod_subjek}-${subject.seksyen}`)"
                              class="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full hover:bg-blue-200 transition-colors"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{{ expandedSchedules[`${subject.kod_subjek}-${subject.seksyen}`] ? 'Hide' : 'Show' }} Schedule</span>
                              <svg 
                                :class="['w-4 h-4 transition-transform', { 'rotate-180': expandedSchedules[`${subject.kod_subjek}-${subject.seksyen}`] }]"
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
  
                        <!-- Collapsible Schedule Information -->
                        <div 
                          v-if="subject.schedule && subject.schedule.length > 0 && expandedSchedules[`${subject.kod_subjek}-${subject.seksyen}`]"
                          class="mt-4 pt-4 border-t transition-all duration-300 ease-in-out"
                        >
                          <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Class Schedule
                          </h4>
                          <div class="grid gap-2">
                            <div 
                              v-for="(sched, idx) in subject.schedule" 
                              :key="idx"
                              class="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                            >
                              <div class="flex items-center space-x-4">
                                <div class="flex items-center space-x-2">
                                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span class="font-semibold text-blue-700">{{ sched.day }}</span>
                                </div>
                                <span class="text-gray-700 font-medium">{{ sched.time }}</span>
                              </div>
                              <div class="flex items-center space-x-2">
                                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span class="text-green-700 font-semibold">{{ sched.venue }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Empty State -->
            <div v-else class="text-center py-12">
              <BookOpenIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 text-lg font-medium">No subjects found</p>
              <p class="text-gray-400 mt-2">Your enrolled subjects will appear here</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue'
  import Sidebar from '@/components/Sidebar.vue'
  import { BookOpenIcon } from '@heroicons/vue/24/outline'
  
  export default {
    name: 'SubjectListView',
    components: { 
      Sidebar,
      BookOpenIcon
    },
    setup() {
      const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi'
      const loading = ref(true)
      const sidebarOpen = ref(false)
      const groupedSubjects = ref({})
      const currentSessionKey = ref('')
      const expandedSessions = ref({})
      const expandedSchedules = ref({})
  
      // Time slot mapping (same as timetable)
      const timeSlots = {
        '1': '8:00 - 8:50',
        '2': '8:00 - 8:50', 
        '3': '9:00 - 9:50',
        '4': '10:00 - 10:50',
        '5': '11:00 - 11:50',
        '6': '12:00 - 12:50',
        '7': '1:00 - 1:50',
        '8': '2:00 - 2:50',
        '9': '3:00 - 3:50',
        '10': '4:00 - 4:50',
        '11': '5:00 - 5:50'
      }
  
      const dayMap = {1:'SUN',2:'MON',3:'TUE',4:'WED',5:'THU',6:'FRI',7:'SAT'}
  
      // Toggle functions
      function toggleSession(sessionKey) {
        expandedSessions.value[sessionKey] = !expandedSessions.value[sessionKey]
      }
  
      function toggleSchedule(subjectKey) {
        expandedSchedules.value[subjectKey] = !expandedSchedules.value[subjectKey]
      }
  
      async function fetchJSON(params) {
        const url = `${TTMS_API}?${new URLSearchParams(params)}`
        console.log('[SubjectList] Fetching:', url)
        const res = await fetch(url)
        const json = await res.json()
        console.log('[SubjectList] Response for', params.entity, json)
        return json
      }
  
      async function loadSubjects() {
        console.log('[SubjectList] loadSubjects() start')
        try {
          const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession'))
          console.log('[SubjectList] loginData:', loginData)
          if (!loginData) return console.error('[SubjectList] No login data')
  
          // Check for cached data first
          const cacheKey = `subjects_${loginData.session_id}`
          const cached = localStorage.getItem(cacheKey)
          if (cached) {
            const cachedData = JSON.parse(cached)
            groupedSubjects.value = cachedData.groupedSubjects
            currentSessionKey.value = cachedData.currentSessionKey
            
            // Auto-expand current session
            expandedSessions.value[currentSessionKey.value] = true
            
            console.log('[SubjectList] Loaded from cache')
            loading.value = false
            return
          }
  
          // Check if session data is already cached (from timetable or dashboard)
          let sesData
          const sessionCacheKey = 'current_session'
          const cachedSession = localStorage.getItem(sessionCacheKey)
          
          if (cachedSession) {
            sesData = JSON.parse(cachedSession)
            console.log('[SubjectList] Using cached session data')
          } else {
            // Fetch current session info
            const [sessionResponse] = await fetchJSON({ entity: 'sesisemester' })
            sesData = sessionResponse
            // Cache session data for other views
            localStorage.setItem(sessionCacheKey, JSON.stringify(sesData))
            console.log('[SubjectList] Fetched and cached session data')
          }
  
          const currentSesi = sesData.sesi
          const currentSemester = sesData.semester
          currentSessionKey.value = `${currentSesi}/${currentSemester}`
          console.log('[SubjectList] Current session:', currentSessionKey.value)
  
          // Check if subjects data is already cached (from timetable or dashboard)
          let subjects
          const subjectsCacheKey = `pelajar_subjek_${loginData.login_name}`
          const cachedSubjects = localStorage.getItem(subjectsCacheKey)
          
          if (cachedSubjects) {
            subjects = JSON.parse(cachedSubjects)
            console.log('[SubjectList] Using cached subjects data')
          } else {
            // Get all enrolled subjects
            subjects = await fetchJSON({
              entity: 'pelajar_subjek',
              no_matrik: loginData.login_name
            })
            // Cache subjects data for other views
            localStorage.setItem(subjectsCacheKey, JSON.stringify(subjects))
            console.log('[SubjectList] Fetched and cached subjects data')
          }
  
          console.log('[SubjectList] All subjects:', subjects)
  
          // Group subjects by session/semester and fetch schedule for each
          const grouped = {}
          
          for (const subject of subjects) {
            const sessionKey = `${subject.sesi}/${subject.semester}`
            
            if (!grouped[sessionKey]) {
              grouped[sessionKey] = []
              // Auto-expand current session
              expandedSessions.value[sessionKey] = sessionKey === currentSessionKey.value
            }
  
            // Check if schedule is already cached
            const scheduleCacheKey = `jadual_${subject.sesi}_${subject.semester}_${subject.kod_subjek}_${subject.seksyen}`
            const cachedSchedule = localStorage.getItem(scheduleCacheKey)
            
            let schedule = []
            if (cachedSchedule) {
              schedule = JSON.parse(cachedSchedule)
              console.log('[SubjectList] Using cached schedule for', subject.kod_subjek)
            } else {
              // Fetch schedule for this subject
              try {
                const scheduleList = await fetchJSON({
                  entity: 'jadual_subjek',
                  sesi: subject.sesi,
                  semester: subject.semester,
                  kod_subjek: subject.kod_subjek,
                  seksyen: subject.seksyen
                })
  
                // Process schedule data
                schedule = scheduleList.map(item => ({
                  day: dayMap[item.hari],
                  time: timeSlots[item.masa] || `${item.masa}:00 - ${item.masa}:50`,
                  venue: item.ruang.nama_ruang_singkatan
                }))
  
                // Cache the processed schedule
                localStorage.setItem(scheduleCacheKey, JSON.stringify(schedule))
                console.log('[SubjectList] Fetched and cached schedule for', subject.kod_subjek)
              } catch (err) {
                console.error('[SubjectList] Error fetching schedule for', subject.kod_subjek, err)
                // Cache empty schedule to avoid repeated failed requests
                localStorage.setItem(scheduleCacheKey, JSON.stringify([]))
              }
            }
  
            grouped[sessionKey].push({
              ...subject,
              schedule
            })
          }
  
          groupedSubjects.value = grouped
          
          // Cache the complete grouped data
          const dataToCache = {
            groupedSubjects: grouped,
            currentSessionKey: currentSessionKey.value,
            timestamp: Date.now()
          }
          localStorage.setItem(cacheKey, JSON.stringify(dataToCache))
          
          console.log('[SubjectList] Grouped subjects:', grouped)
          console.log('[SubjectList] Data cached successfully')
  
        } catch (err) {
          console.error('[SubjectList] Error:', err)
        } finally {
          loading.value = false
          console.log('[SubjectList] loadSubjects() end')
        }
      }
  
      // Computed properties for stats
      const totalSubjects = computed(() => {
        return Object.values(groupedSubjects.value)
          .flat()
          .length
      })
  
      const currentSessionSubjects = computed(() => {
        return groupedSubjects.value[currentSessionKey.value]?.length || 0
      })
  
      const electiveSubjects = computed(() => {
        return Object.values(groupedSubjects.value)
          .flat()
          .filter(subject => subject.kod_subjek.startsWith('U'))
          .length
      })
  
      // Sort session keys with current session first
      const sortedSessionKeys = computed(() => {
        const keys = Object.keys(groupedSubjects.value)
        return keys.sort((a, b) => {
          if (a === currentSessionKey.value) return -1
          if (b === currentSessionKey.value) return 1
          // Sort by session/semester in descending order (most recent first)
          return b.localeCompare(a)
        })
      })
  
      onMounted(loadSubjects)
  
      // Add cache management function
      function clearCache() {
        const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession') || '{}')
        if (loginData.session_id) {
          // Clear all related cache keys
          localStorage.removeItem(`subjects_${loginData.session_id}`)
          localStorage.removeItem(`timetable_${loginData.session_id}`)
          localStorage.removeItem('current_session')
          localStorage.removeItem(`pelajar_subjek_${loginData.login_name}`)
          
          // Clear individual schedule caches (this would require tracking, but for now we can skip)
          console.log('[SubjectList] Cache cleared')
        }
      }
  
      return {
        loading,
        sidebarOpen,
        groupedSubjects,
        currentSessionKey,
        expandedSessions,
        expandedSchedules,
        totalSubjects,
        currentSessionSubjects,
        electiveSubjects,
        sortedSessionKeys,
        toggleSession,
        toggleSchedule,
        clearCache // Add this for debugging/manual cache clearing
      }
    }
  }
  </script>
  
  <style scoped>
  /* Smooth transitions for collapsible elements */
  .transition-all {
    transition: all 0.3s ease-in-out;
  }
  </style>