<template>
  <div class="relative min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar
      :open="sidebarOpen"
      @update:open="val => sidebarOpen = val"
    />

    <!-- Main content -->
    <div class="flex flex-col">
      <!-- Header -->
      <header class="flex items-center justify-between p-4 bg-white shadow">
        <button @click="sidebarOpen = true" class="p-2">
          <!-- Hamburger Icon -->
          <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 class="text-xl font-semibold text-gray-800">My Timetable</h1>

        <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
          <img src="@/assets/user-avatar.jpg"
               alt="Avatar"
               class="object-cover h-full w-full"
               onerror="this.style.display='none'" />
        </div>
      </header>

      <!-- Timetable Content -->
      <main class="p-4 sm:p-6 bg-white flex-1 overflow-auto">
        <!-- Session Selection -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Academic Sessions</h2>
          
          <!-- First Session (Always Visible) -->
          <div 
            v-if="availableCombinedSessions.length > 0"
            @click="selectCombinedSession(availableCombinedSessions[0])"
            class="py-2 px-3 cursor-pointer hover:bg-gray-100 flex items-center justify-between rounded"
            :class="{'bg-blue-50': isSelectedCombinedSession(availableCombinedSessions[0])}"
          >
            <div class="flex items-center">
              <span class="mr-2">▸</span>
              <span class="font-medium">
                {{ availableCombinedSessions[0].sesi }} {{ availableCombinedSessions[0].semester }}
                <span v-if="isCurrentCombinedSession(availableCombinedSessions[0])" class="text-sm text-green-600 ml-1">(Current)</span>
              </span>
            </div>
          </div>
          
          <!-- Dropdown for Other Sessions -->
          <div class="mt-2">
            <button 
              @click="showAllSessions = !showAllSessions" 
              class="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <svg 
                :class="['w-4 h-4 mr-1 transition-transform', { 'rotate-180': showAllSessions }]"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              {{ showAllSessions ? 'Hide' : 'Show' }} all sessions
            </button>
            
            <div v-if="showAllSessions" class="mt-2 space-y-1 max-w-2xl pl-4 border-l-2 border-gray-200">
              <div 
                v-for="(session, index) in availableCombinedSessions.slice(1)" 
                :key="`${session.sesi}-${session.semester}`"
                @click="selectCombinedSession(session)"
                class="py-2 px-3 cursor-pointer hover:bg-gray-100 flex items-center justify-between rounded"
                :class="{'bg-blue-50': isSelectedCombinedSession(session)}"
              >
                <div class="flex items-center">
                  <span class="mr-2">▸</span>
                  <span class="font-medium">
                    {{ session.sesi }} {{ session.semester }}
                    <span v-if="isCurrentCombinedSession(session)" class="text-sm text-green-600 ml-1">(Current)</span>
                  </span>
                </div>
              </div>
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

        <!-- No Timetable Message -->
        <div v-else-if="!hasTimetableData" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Timetable Found</h3>
          <p class="text-gray-500">
            {{ selectedSession && selectedSemester 
              ? `No classes found for Session ${selectedSession}, Semester ${selectedSemester}` 
              : 'Please select a session to view timetable' }}
          </p>
        </div>

        <!-- Timetable Display -->
        <div v-else class="mt-2 bg-white rounded-lg border p-3">
          <!-- Daily View Timetable -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <h6 class="text-sm font-medium text-gray-700">Daily View</h6>
              <div class="flex space-x-1">
                <button 
                  v-for="day in displayDays" 
                  :key="day"
                  @click="selectedDay = day"
                  :class="[
                    'px-2 py-1 text-xs rounded',
                    selectedDay === day ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  ]"
                >
                  {{ day }}
                </button>
              </div>
            </div>
            
            <!-- Daily Schedule -->
            <div class="bg-gray-50 rounded p-3">
              <div 
                v-if="getDailySchedule(selectedDay).length > 0"
                class="space-y-2"
              >
                <div 
                  v-for="(classItem, idx) in getDailySchedule(selectedDay)" 
                  :key="idx"
                  @click="selectedClass = classItem"
                  class="bg-white p-3 rounded border cursor-pointer hover:bg-blue-50"
                >
                  <div class="flex justify-between">
                    <div>
                      <div class="font-medium">{{ classItem.subject }}</div>
                      <div class="text-sm text-gray-600">
                        {{ getTimeSlotLabel(classItem.slot) }} | {{ classItem.venue || 'TBA' }}
                      </div>
                    </div>
                    <div 
                      class="w-3 h-3 rounded-full mt-1"
                      :style="{ backgroundColor: getSubjectColor(classItem.subject) }"
                    ></div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-gray-500">
                No classes scheduled for {{ selectedDay }}
              </div>
            </div>
          </div>
          
          <!-- Class Details Modal -->
          <div 
            v-if="selectedClass" 
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="selectedClass = null"
          >
            <div class="bg-white rounded-lg p-4 max-w-md w-full mx-4">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-medium">Class Details</h3>
                <button @click="selectedClass = null" class="text-gray-500 hover:text-gray-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="space-y-2">
                <div>
                  <span class="text-gray-600">Course:</span>
                  <span class="font-medium ml-2">{{ selectedClass.subject }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Course Name:</span>
                  <span class="font-medium ml-2">{{ getSubjectName(selectedClass.subject) }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Section:</span>
                  <span class="font-medium ml-2">{{ selectedClass.section || 'N/A' }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Time:</span>
                  <span class="font-medium ml-2">{{ getTimeSlotLabel(selectedClass.slot) }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Venue:</span>
                  <span class="font-medium ml-2">{{ selectedClass.venue || 'TBA' }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Lecturer:</span>
                  <span class="font-medium ml-2">{{ selectedClass.lecturer || 'TBA' }}</span>
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <button 
                  @click="selectedClass = null"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          
          <!-- Weekly View (Compact) -->
          <div>
            <h6 class="text-sm font-medium text-gray-700 mb-2">Weekly Overview</h6>
            <div class="overflow-x-auto">
              <table class="w-full text-xs border-collapse">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="py-1 px-1 text-left text-gray-500 text-xs w-16">Time</th>
                    <th 
                      v-for="day in displayDays" 
                      :key="day"
                      class="py-1 px-1 text-center text-gray-500 text-xs w-12"
                    >
                      {{ day.substring(0, 1) }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="slot in timeSlots" :key="slot.key">
                    <td class="py-1 px-1 text-gray-600 font-medium text-xs">
                      {{ slot.label }}
                    </td>
                    <td 
                      v-for="day in displayDays" 
                      :key="day"
                      class="py-1 px-1 text-center"
                    >
                      <div 
                        v-if="hasClass(day, slot.key)"
                        class="w-3 h-3 mx-auto rounded-full"
                        :style="{
                          backgroundColor: getSubjectColor(getClassSubject(day, slot.key))
                        }"
                      ></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'TimetableView',
  components: { Sidebar },
  setup() {
    const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi'
    const loading = ref(false)
    const timetable = ref({})
    const selectedDay = ref('MON')
    const selectedClass = ref(null)
    const subjectDetails = ref({})
    const showAllSessions = ref(false)
    
    // Session and semester management
    const availableCombinedSessions = ref([])
    const selectedSession = ref('')
    const selectedSemester = ref('')
    const currentSession = ref('')
    const currentSemester = ref('')
    
    const days = ['SUN','MON','TUE','WED','THU','FRI','SAT']
    const displayDays = computed(() =>
      days.filter(d => ['MON','TUE','WED','THU','FRI'].includes(d))
    )

    const hasTimetableData = computed(() => {
      return Object.keys(timetable.value).some(day => 
        timetable.value[day] && Object.keys(timetable.value[day]).length > 0
      )
    })

    // Color palette for subjects
    const subjectColors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
      '#14B8A6', '#F43F5E', '#8B5A2B', '#059669', '#7C3AED'
    ]
    const subjectColorMap = ref({})

    const timeSlots = [
      { key: '2',  label: '8:00 - 8:50'  },
      { key: '3',  label: '9:00 - 9:50'  },
      { key: '4',  label: '10:00 - 10:50'},
      { key: '5',  label: '11:00 - 11:50'},
      { key: '6',  label: '12:00 - 12:50'},
      { key: '7',  label: '1:00 - 1:50'  },
      { key: '8',  label: '2:00 - 2:50'  },
      { key: '9',  label: '3:00 - 3:50'  },
      { key: '10', label: '4:00 - 4:50'  },
      { key: '11', label: '5:00 - 5:50'  },
    ]
    const timeSlotsMap = timeSlots.reduce((m,s) => { m[s.key]=s.label; return m }, {})

    function getSubjectColor(subjectCode) {
      if (!subjectColorMap.value[subjectCode]) {
        const colorIndex = Object.keys(subjectColorMap.value).length % subjectColors.length
        subjectColorMap.value[subjectCode] = subjectColors[colorIndex]
      }
      return subjectColorMap.value[subjectCode]
    }
    
    function getTimeSlotLabel(slotKey) {
      return timeSlotsMap[slotKey] || `Slot ${slotKey}`
    }
    
    function getSubjectName(subjectCode) {
      return subjectDetails.value[subjectCode]?.name || subjectCode
    }
    
    function hasClass(day, slot) {
      return timetable.value[day] && timetable.value[day][slot]
    }
    
    function getClassSubject(day, slot) {
      return timetable.value[day] && timetable.value[day][slot] ? timetable.value[day][slot].subject : ''
    }
    
    function getDailySchedule(day) {
      if (!timetable.value[day]) return []
      
      const schedule = []
      
      for (const slot in timetable.value[day]) {
        schedule.push({
          slot,
          subject: timetable.value[day][slot].subject,
          venue: timetable.value[day][slot].venue,
          section: timetable.value[day][slot].section,
          lecturer: timetable.value[day][slot].lecturer || 'TBA'
        })
      }
      
      // Sort by time slot
      schedule.sort((a, b) => parseInt(a.slot) - parseInt(b.slot))
      
      return schedule
    }

    function isCurrentCombinedSession(session) {
      return session.sesi === currentSession.value && session.semester === currentSemester.value
    }

    function isSelectedCombinedSession(session) {
      return session.sesi === selectedSession.value && session.semester === selectedSemester.value
    }

    function selectCombinedSession(session) {
      if (isSelectedCombinedSession(session)) return
      
      selectedSession.value = session.sesi
      selectedSemester.value = session.semester
      timetable.value = {}
      
      loadTimetableForPeriod()
    }

    async function fetchJSON(params) {
      const url = `${TTMS_API}?${new URLSearchParams(params)}`
      console.log('[Timetable] Fetching:', url)
      const res = await fetch(url)
      const json = await res.json()
      console.log('[Timetable] Response for', params.entity, json)
      return json
    }

    async function loadCurrentPeriod() {
      try {
        // Check if session data is already cached (following SubjectListView pattern)
        const sessionCacheKey = 'current_session'
        const cachedSession = localStorage.getItem(sessionCacheKey)
        
        let sesData
        if (cachedSession) {
          sesData = JSON.parse(cachedSession)
          console.log('[Timetable] Using cached session data:', sesData)
        } else {
          // Fetch current session info and cache it
          const [sessionResponse] = await fetchJSON({ entity: 'sesisemester' })
          sesData = sessionResponse
          // Cache session data for other views to use
          localStorage.setItem(sessionCacheKey, JSON.stringify(sesData))
          console.log('[Timetable] Fetched and cached session data:', sesData)
        }
        
        currentSession.value = sesData.sesi
        currentSemester.value = sesData.semester
        selectedSession.value = currentSession.value
        selectedSemester.value = currentSemester.value
        
        console.log('[Timetable] Current period set:', currentSession.value, currentSemester.value)
      } catch (err) {
        console.error('[Timetable] Error loading current period:', err)
      }
    }

    async function loadAvailableSessions() {
      loading.value = true
      try {
        const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession'))
        if (!loginData) return console.error('[Timetable] No login data')

        // Check if subjects data is already cached (following SubjectListView pattern)
        const subjectsCacheKey = `pelajar_subjek_${loginData.login_name}`
        const cachedSubjects = localStorage.getItem(subjectsCacheKey)
        
        let subjects
        if (cachedSubjects) {
          subjects = JSON.parse(cachedSubjects)
          console.log('[Timetable] Using cached subjects data for sessions')
        } else {
          // Get all subjects for the student to determine available sessions
          subjects = await fetchJSON({
            entity: 'pelajar_subjek',
            no_matrik: loginData.login_name
          })
          // Cache subjects data for other views to use
          localStorage.setItem(subjectsCacheKey, JSON.stringify(subjects))
          console.log('[Timetable] Fetched and cached subjects data for sessions')
        }

        // Create combined session-semester entries
        const sessionMap = {}
        subjects.forEach(subject => {
          const key = `${subject.sesi}-${subject.semester}`
          if (!sessionMap[key]) {
            sessionMap[key] = {
              sesi: subject.sesi,
              semester: subject.semester
            }
          }
        })

        // Convert to array and sort (newest first)
        const combinedSessions = Object.values(sessionMap).sort((a, b) => {
          const yearA = parseInt(a.sesi.split('/')[0])
          const yearB = parseInt(b.sesi.split('/')[0])
          if (yearA !== yearB) return yearB - yearA
          return parseInt(b.semester) - parseInt(a.semester)
        })

        availableCombinedSessions.value = combinedSessions
        
        console.log('[Timetable] Available combined sessions:', availableCombinedSessions.value)
      } catch (err) {
        console.error('[Timetable] Error loading sessions:', err)
      } finally {
        loading.value = false
      }
    }

    async function loadTimetableForPeriod() {
      if (!selectedSession.value || !selectedSemester.value) return
      
      console.log('[Timetable] Loading timetable for session:', selectedSession.value, 'semester:', selectedSemester.value)
      loading.value = true
      
      try {
        const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession'))
        if (!loginData) return console.error('[Timetable] No login data')

        // Enhanced cache key following SubjectListView pattern
        const cacheKey = `timetable_${loginData.session_id}_${selectedSession.value}_${selectedSemester.value}`
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const cachedData = JSON.parse(cached)
          // Check if cache is still valid (less than 1 hour old)
          const cacheAge = Date.now() - (cachedData.timestamp || 0)
          const cacheMaxAge = 60 * 60 * 1000 // 1 hour
          
          if (cacheAge < cacheMaxAge) {
            timetable.value = cachedData.timetable || cachedData
            subjectDetails.value = cachedData.subjectDetails || {}
            console.log('[Timetable] Loaded from cache (age:', Math.round(cacheAge / 1000 / 60), 'minutes)')
            loading.value = false
            return
          } else {
            console.log('[Timetable] Cache expired, fetching fresh data')
            localStorage.removeItem(cacheKey)
          }
        }

        // Use cached subjects data if available
        const subjectsCacheKey = `pelajar_subjek_${loginData.login_name}`
        const cachedSubjects = localStorage.getItem(subjectsCacheKey)
        
        let subjects
        if (cachedSubjects) {
          subjects = JSON.parse(cachedSubjects)
          console.log('[Timetable] Using cached subjects data for timetable')
        } else {
          subjects = await fetchJSON({
            entity: 'pelajar_subjek',
            no_matrik: loginData.login_name
          })
          localStorage.setItem(subjectsCacheKey, JSON.stringify(subjects))
          console.log('[Timetable] Fetched and cached subjects data for timetable')
        }

        const data = {}
        const subjectInfo = {}
        const hariMap = {1:'SUN',2:'MON',3:'TUE',4:'WED',5:'THU',6:'FRI',7:'SAT'}

        for (const subj of subjects) {
          if (`${subj.sesi}` === `${selectedSession.value}` && `${subj.semester}` === `${selectedSemester.value}`) {
            // Store subject details
            subjectInfo[subj.kod_subjek] = {
              name: subj.nama_subjek || subj.kod_subjek,
              section: subj.seksyen,
              credits: subj.kredit
            }
            
            // Check if schedule is already cached (following SubjectListView pattern)
            const scheduleCacheKey = `jadual_${subj.sesi}_${subj.semester}_${subj.kod_subjek}_${subj.seksyen}`
            const cachedSchedule = localStorage.getItem(scheduleCacheKey)
            
            let list
            if (cachedSchedule) {
              // Parse cached schedule and convert to expected format
              const scheduleData = JSON.parse(cachedSchedule)
              list = scheduleData.map ? scheduleData : [] // Handle both formats
              console.log('[Timetable] Using cached schedule for', subj.kod_subjek)
            } else {
              list = await fetchJSON({
                entity: 'jadual_subjek',
                sesi: selectedSession.value,
                semester: selectedSemester.value,
                kod_subjek: subj.kod_subjek,
                seksyen: subj.seksyen
              })
              // Cache the schedule data
              localStorage.setItem(scheduleCacheKey, JSON.stringify(list))
              console.log('[Timetable] Fetched and cached schedule for', subj.kod_subjek)
            }
            
            for (const item of list) {
              const day = hariMap[item.hari]
              const slot = `${item.masa}`
              data[day] = data[day] || {}
              data[day][slot] = {
                subject: subj.kod_subjek,
                venue: item.ruang?.nama_ruang_singkatan || 'TBA',
                section: subj.seksyen,
                lecturer: item.pensyarah || 'TBA'
              }
            }
          }
        }

        timetable.value = data
        subjectDetails.value = subjectInfo
        
        // Cache with timestamp following SubjectListView pattern
        const dataToCache = {
          timetable: data,
          subjectDetails: subjectInfo,
          timestamp: Date.now()
        }
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache))
        console.log('[Timetable] Timetable loaded and cached:', data)

      } catch (err) {
        console.error('[Timetable] Error loading timetable:', err)
      } finally {
        loading.value = false
      }
    }

    // Add cache management function (following SubjectListView pattern)
    function clearCache() {
      const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession') || '{}')
      if (loginData.session_id) {
        // Clear all related cache keys
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (
            key.startsWith(`timetable_${loginData.session_id}`) ||
            key.startsWith(`subjects_${loginData.session_id}`) ||
            key.startsWith(`pelajar_subjek_${loginData.login_name}`) ||
            key.startsWith('jadual_') ||
            key === 'current_session'
          )) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        console.log('[Timetable] Cache cleared:', keysToRemove.length, 'items removed')
      }
    }

    async function initialize() {
      await loadCurrentPeriod()
      await loadAvailableSessions()
      
      // Auto-load timetable for current session
      if (selectedSession.value && selectedSemester.value) {
        await loadTimetableForPeriod()
      }
    }

    onMounted(initialize)
    const sidebarOpen = ref(false)

    return {
      loading,
      timetable, hasTimetableData,
      displayDays, selectedDay, timeSlots, timeSlotsMap,
      sidebarOpen, selectedClass,
      availableCombinedSessions,
      selectedSession, selectedSemester,
      currentSession, currentSemester,
      showAllSessions,
      loadTimetableForPeriod,
      getTimeSlotLabel,
      getSubjectName,
      getSubjectColor,
      hasClass,
      getClassSubject,
      getDailySchedule,
      isCurrentCombinedSession,
      isSelectedCombinedSession,
      selectCombinedSession,
      clearCache
    }
  }
}
</script>