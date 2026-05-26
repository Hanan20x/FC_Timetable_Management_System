<template>
  <div class="relative min-h-screen bg-gray-50">
    <Sidebar :open="sidebarOpen" @update:open="v => sidebarOpen = v" />

    <div class="flex flex-col">
      <header class="flex items-center justify-between p-4 bg-white shadow">
        <button @click="sidebarOpen = true" class="p-2">
          <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <h1 class="text-xl font-semibold text-gray-800">Dashboard</h1>
        <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
          <img src="@/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full" onerror="this.style.display='none'" />
        </div>
      </header>

      <main class="p-4 sm:p-6 bg-white flex-1 overflow-auto">
        <div class="mb-4">
          <h2 class="text-lg font-medium text-orange-500">Welcome, {{ userData.full_name }}</h2>
          <h3 class="text-gray-700 font-medium">Dashboard</h3>
        </div>

        <div class="bg-white rounded-lg border p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center mb-4 sm:mb-0">
            <div class="h-12 w-12 rounded-full overflow-hidden mr-3 bg-gray-300">
              <img src="@/assets/user-avatar.jpg" alt="User Avatar" class="object-cover h-full w-full" onerror="this.style.display='none'" />
            </div>
            <div>
              <p class="font-medium">{{ userData.full_name }}</p>
              <p class="text-sm text-gray-500">{{ userData.description }}</p>
            </div>
          </div>
          <div class="text-sm text-gray-700 space-y-1 text-right sm:text-left">
            <p><strong>Program:</strong> {{ programName }}</p>
            <p><strong>Credits Completed:</strong> {{ totalCredits }}</p>
            <p><strong>Current Semester:</strong> {{ currentSemesterNumber }}/{{ totalProgramSemesters }}</p>
          </div>
        </div>

        <!-- Refined Total Courses Box -->
        <div class="bg-yellow-200 rounded-lg p-6 mb-6 text-center">
          <h3 class="font-medium mb-2">Total Courses ({{ semesterInfo }})</h3>
          <p class="text-4xl font-bold text-gray-800">{{ currentCourses }}</p>
          <p class="text-sm text-gray-600 mb-4">{{ currentElectives }} {{ currentElectives === 1 ? 'Elective' : 'Electives' }}</p>
          <button
            @click="toggleSubjectDetails"
            class="px-5 py-2 bg-white text-black border border-black/20 rounded-full hover:bg-gray-100 transition"
          >
            {{ showSubjectDetails ? 'Hide Details' : 'Show Details' }}
          </button>
        </div>

        <!-- Current Session Subject Details -->
        <div v-if="showSubjectDetails && currentSessionSubjects.length > 0" class="mb-6">
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-green-100 to-blue-100 px-6 py-4 border-b">
              <h3 class="text-lg font-semibold text-gray-800">Current Session Subjects - {{ semesterInfo }}</h3>
              <p class="text-sm text-gray-600 mt-1">{{ currentSessionSubjects.length }} subjects enrolled</p>
            </div>
            <div class="p-6">
              <div class="grid gap-4">
                <div 
                  v-for="subject in currentSessionSubjects" 
                  :key="`${subject.kod_subjek}-${subject.seksyen}`"
                  class="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="font-semibold text-lg text-gray-800 mb-1">
                        {{ subject.nama_subjek || subject.kod_subjek }}
                      </h4>
                      <p class="text-md text-blue-700 font-medium mb-1">
                        {{ subject.kod_subjek }}
                      </p>
                      <p class="text-sm text-gray-600">
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
                        <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {{ subject.kod_subjek.startsWith('U') ? '2' : '3' }} Credits
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Today's Classes -->
        <div class="mb-6">
          <h3 class="font-medium mb-3">Today's Classes – {{ todayName }}</h3>
          <div v-if="!isDataLoaded" class="text-center text-gray-500 py-2">
            Loading...
          </div>
          <div v-else-if="todayClasses.length">
            <div v-for="(cls, idx) in todayClasses" :key="idx" :class="['rounded-lg p-4 mb-3', getClassStatusColor(cls.status)]">
              <div class="flex justify-between">
                <div>
                  <p class="text-xs text-gray-600">{{ cls.time }}</p>
                  <p class="font-medium">{{ cls.subject }}</p>
                  <p class="text-sm text-gray-500">{{ cls.subjectName }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs italic">{{ cls.venue }}</p>
                  <p v-if="cls.status" class="text-xs italic">{{ cls.status }}</p>
                </div>
              </div>
            </div>
          </div>
          <p v-else-if="isWeekend" class="text-center text-gray-500 py-2">No classes today</p>
          <p v-else class="text-center text-gray-500 py-2">No classes scheduled for today</p>
        </div>

        <!-- Upcoming -->
        <div class="mb-6">
          <h3 class="font-medium mb-3">Upcoming</h3>
          <div v-if="!isDataLoaded" class="text-center text-gray-500 py-2">
            Loading...
          </div>
          <div v-else-if="upcomingClasses.length">
            <div v-for="(cls, idx) in upcomingClasses" :key="idx" class="bg-blue-50 rounded-lg p-4 mb-3">
              <div class="flex justify-between">
                <div>
                  <p class="text-xs text-gray-600">{{ cls.day }} {{ cls.time }}</p>
                  <p class="font-medium">{{ cls.subject }}</p>
                  <p class="text-sm text-gray-500">{{ cls.subjectName }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs italic">{{ cls.venue }}</p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-center text-gray-500 py-2">No upcoming classes</p>
        </div>

        <!-- Announcements/Notices Section -->
        <div class="mb-6">
          <div class="bg-blue-800 rounded-lg p-4 text-white relative overflow-hidden">
            <!-- Background decoration -->
            <div class="absolute top-0 right-0 w-24 h-24 bg-blue-700 rounded-full opacity-30 transform translate-x-8 -translate-y-8"></div>
            <div class="absolute bottom-0 left-0 w-16 h-16 bg-blue-700 rounded-full opacity-20 transform -translate-x-4 translate-y-4"></div>
            
            <div class="relative z-10">
              <div class="flex items-center mb-3">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <h3 class="font-semibold text-lg">Announcement</h3>
              </div>
              <p class="text-blue-100 leading-relaxed mb-3">
                Perhatian kepada semua pelajar UTM, tutorial akhir sebelum peperiksaan akhir semester akan diadakan seperti yang telah dirancang. Pastikan anda hadir pada sesi tutorial untuk persiapan peperiksaan akhir semester.
              </p>
              <div class="flex items-center justify-between">
                <span class="text-blue-200 text-sm">Academic Office</span>
                <span class="text-blue-300 text-xs">10:24</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'

export default {
  components: { Sidebar },
  setup() {
    const router = useRouter()
    const TTMS = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi'
    const sidebarOpen = ref(false)
    const userData = ref({})
    const courseCount = ref(0)
    const electivesCount = ref(0)
    const totalCredits = ref(0)
    const allCredits = ref(0)
    const programName = ref('Unknown')
    const semesterInfo = ref('')
    const todayClasses = ref([])
    const upcomingClasses = ref([])
    const currentCourses = ref(0)
    const currentElectives = ref(0)
    const currentSessionSubjects = ref([])
    const showSubjectDetails = ref(false)
    const totalSemesters = ref(0)
    const currentSemesterNumber = ref(0)
    const totalProgramSemesters = ref(8) // Default to 8 semesters for most programs
    const isDataLoaded = ref(false)
    const subjectColorMap = ref({})

    // Fixed time slot mapping - consistent with timetable view
    const slotTimes = {
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

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    // Fixed day mapping - consistent with timetable view
    const hariToJsDay = {1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6} // TTMS day to JS day
    
    // Get current Malaysia time
    function getMalaysiaTime() {
      return new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"}))
    }

    const now = getMalaysiaTime()
    const todayJsDay = now.getDay() // 0=Sunday, 1=Monday, etc.
    const todayName = dayNames[todayJsDay]
    const currentHour = now.getHours() + now.getMinutes() / 60
    const isWeekend = todayJsDay === 0 || todayJsDay === 6 // Sunday or Saturday

    function getClassStatusColor(status) {
      switch ((status || '').toLowerCase()) {
        case 'ongoing': return 'bg-red-100'
        case 'attended': return 'bg-green-100'
        default: return 'bg-purple-100'
      }
    }

    function getSubjectColor(code) {
      if (!subjectColorMap.value[code]) {
        const colors = ['bg-rose-100','bg-orange-100','bg-amber-100','bg-lime-100','bg-cyan-100','bg-sky-100']
        const index = Object.keys(subjectColorMap.value).length % colors.length
        subjectColorMap.value[code] = colors[index]
      }
      return subjectColorMap.value[code]
    }

    function toggleSubjectDetails() {
      showSubjectDetails.value = !showSubjectDetails.value
    }

    // Helper function to convert time slot to decimal hours for comparison
    function timeSlotToHours(slot) {
      const slotNum = parseInt(slot)
      switch(slotNum) {
        case 1:
        case 2: return 8
        case 3: return 9
        case 4: return 10
        case 5: return 11
        case 6: return 12
        case 7: return 13
        case 8: return 14
        case 9: return 15
        case 10: return 16
        case 11: return 17
        default: return slotNum
      }
    }

    async function fetchJSON(params) {
      const url = `${TTMS}?${new URLSearchParams(params)}`
      const res = await fetch(url)
      return res.json()
    }

 async function loadDashboard() {
  try {
    const session = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession') || '{}')
    if (!session.login_name || !session.session_id) return

    userData.value = session
    const userId = session.login_name
    const sessionId = session.session_id

    // -----------------------
    // Step 1: Fetch sesisemester (session info)
    // -----------------------
    let sesData
    const sesCacheKey = 'current_session'
    const cachedSesi = localStorage.getItem(sesCacheKey)
    if (cachedSesi) {
      sesData = JSON.parse(cachedSesi)
    } else {
      const [fetched] = await fetchJSON({ entity: 'sesisemester' })
      sesData = fetched
      localStorage.setItem(sesCacheKey, JSON.stringify(sesData))
    }

    const { sesi, semester } = sesData
    semesterInfo.value = `${sesi} / ${semester}`

    // -----------------------
    // Step 2: Fetch Subjects
    // -----------------------
    const subjectsCacheKey = `pelajar_subjek_${userId}`
    let subjects
    const cachedSubjects = localStorage.getItem(subjectsCacheKey)
    if (cachedSubjects) {
      subjects = JSON.parse(cachedSubjects)
    } else {
      subjects = await fetchJSON({ entity: 'pelajar_subjek', no_matrik: userId })
      localStorage.setItem(subjectsCacheKey, JSON.stringify(subjects))
    }

    courseCount.value = subjects.length
    electivesCount.value = subjects.filter(s => s.kod_subjek.startsWith('U')).length
    totalCredits.value = subjects.reduce((acc, s) => acc + (s.kod_subjek.startsWith('U') ? 2 : 3), 0)
    allCredits.value = totalCredits.value
    programName.value = subjects[0]?.kod_program || 'Unknown'

    // -----------------------
    // Step 3: Calculate Semester Info
    // -----------------------
    const uniqueSemesters = new Set()
    subjects.forEach(s => uniqueSemesters.add(`${s.sesi}/${s.semester}`))
    totalSemesters.value = uniqueSemesters.size

    const sortedKeys = Array.from(uniqueSemesters).sort()
    const currentKey = `${sesi}/${semester}`
    currentSemesterNumber.value = sortedKeys.indexOf(currentKey) + 1

    const program = programName.value.toLowerCase()
    if (program.includes('phd') || program.includes('doctor')) totalProgramSemesters.value = 6
    else if (program.includes('master') || program.includes('msc')) totalProgramSemesters.value = 4
    else if (program.includes('diploma')) totalProgramSemesters.value = 6
    else totalProgramSemesters.value = 8

    const current = subjects.filter(s => s.sesi === sesi && s.semester === semester)
    currentCourses.value = current.length
    currentElectives.value = current.filter(s => s.kod_subjek.startsWith('U')).length
    currentSessionSubjects.value = current

    // -----------------------
    // Step 4: Fetch Schedules (per subject, cached)
    // -----------------------
    const hariToJsDay = {1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6}
    const all = []

    for (const s of current) {
      const scheduleKey = `jadual_${sesi}_${semester}_${s.kod_subjek}_${s.seksyen}`
      let schedule
      const cachedSchedule = localStorage.getItem(scheduleKey)
      if (cachedSchedule) {
        schedule = JSON.parse(cachedSchedule)
      } else {
        schedule = await fetchJSON({
          entity: 'jadual_subjek',
          sesi, semester,
          kod_subjek: s.kod_subjek,
          seksyen: s.seksyen
        })
        localStorage.setItem(scheduleKey, JSON.stringify(schedule))
      }

      for (const item of schedule) {
        const jsDay = hariToJsDay[item.hari]
        const slot = item.masa.toString()
        const time = slotTimes[slot] || `${slot}:00 - ${slot}:50`

        let status = ''
        if (jsDay === todayJsDay) {
          const classStartHour = timeSlotToHours(slot)
          const classEndHour = classStartHour + 0.83
          if (currentHour >= classStartHour && currentHour <= classEndHour) {
            status = 'Ongoing'
          } else if (currentHour > classEndHour) {
            status = 'Attended'
          }
        }

        all.push({
          jsDay,
          ttmsDay: item.hari,
          day: dayNames[jsDay],
          time,
          subject: s.kod_subjek,
          subjectName: s.nama_subjek || s.kod_subjek,
          venue: item.ruang?.nama_ruang_singkatan || 'TBA',
          status,
          sortTime: timeSlotToHours(slot)
        })
      }
    }

    todayClasses.value = all.filter(e => e.jsDay === todayJsDay).sort((a, b) => a.sortTime - b.sortTime)
    upcomingClasses.value = all
      .filter(e => {
        if (e.jsDay === todayJsDay) return false
        let daysUntil = e.jsDay - todayJsDay
        if (daysUntil <= 0) daysUntil += 7
        return daysUntil <= 7
      })
      .sort((a, b) => {
        let aDaysUntil = a.jsDay - todayJsDay
        if (aDaysUntil <= 0) aDaysUntil += 7
        let bDaysUntil = b.jsDay - todayJsDay
        if (bDaysUntil <= 0) bDaysUntil += 7
        return aDaysUntil - bDaysUntil || a.sortTime - b.sortTime
      })
      .slice(0, 10)

  } catch (err) {
    console.error('[Dashboard] Error loading dashboard:', err)
  } finally {
    isDataLoaded.value = true
  }
}

    function goToSubjects() {
      router.push('/subject-list')
    }

    onMounted(loadDashboard)

    return {
      sidebarOpen, userData, courseCount, electivesCount, totalCredits,
      allCredits, programName, semesterInfo, todayClasses, upcomingClasses,
      getClassStatusColor, getSubjectColor, todayName, isWeekend,
      currentCourses, currentElectives, currentSessionSubjects, 
      showSubjectDetails, toggleSubjectDetails, totalSemesters, 
      currentSemesterNumber, totalProgramSemesters, isDataLoaded, goToSubjects
    }
  }
}
</script>