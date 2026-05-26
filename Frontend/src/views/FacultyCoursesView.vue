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
        <h1 class="text-xl font-semibold text-gray-800">Courses Offered - Faculty of Computing</h1>
        <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
          <img src="@/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full" />
        </div>
      </header>

      <main class="p-4 sm:p-6 bg-white flex-1">
        <!-- Combined Session/Semester Selection -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 class="text-lg font-medium mb-4 text-gray-800">Select Academic Period</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label for="periodSelect" class="block text-sm font-medium text-gray-700 mb-2">
                Academic Session & Semester
              </label>
              <select
                id="periodSelect"
                v-model="selectedPeriod"
                @change="onPeriodChange"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="loadingPeriods"
              >
                <option value="">Select Session & Semester</option>
                <option
                  v-for="period in availablePeriods"
                  :key="period.value"
                  :value="period.value"
                >
                  {{ period.label }}{{ period.isCurrent ? ' (Current)' : '' }}
                </option>
              </select>
            </div>
            <div>
              <button
                @click="loadCourses"
                :disabled="!selectedPeriod || loading"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {{ loading ? 'Loading...' : 'Load Courses' }}
              </button>
            </div>
          </div>
          <!-- Current Selection Display -->
          <div v-if="selectedPeriod" class="mt-4 p-3 bg-blue-50 rounded-md">
            <p class="text-sm text-blue-800">
              <span class="font-medium">Viewing:</span>
              Courses - {{ selectedPeriodLabel }}
              <span v-if="isCurrentPeriod" class="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Current Period
              </span>
            </p>
          </div>
        </div>

        <!-- Search and Filter -->
        <div v-if="courses.length > 0" class="mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div class="relative flex-grow mb-2 md:mb-0">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search courses by name or code..."
                class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
        <div v-else-if="courses.length > 0" class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-blue-100 rounded-lg p-4">
              <h3 class="text-center font-medium mb-2">Total Courses</h3>
              <p class="text-2xl font-bold text-center text-blue-600">{{ filteredCourses.length }}</p>
            </div>
            <div class="bg-green-100 rounded-lg p-4">
              <h3 class="text-center font-medium mb-2">Total Sections</h3>
              <p class="text-2xl font-bold text-center text-green-600">{{ totalSections }}</p>
            </div>
            <div class="bg-yellow-100 rounded-lg p-4">
              <h3 class="text-center font-medium mb-2">Total Students Enrolled</h3>
              <p class="text-2xl font-bold text-center text-yellow-600">{{ totalStudents }}</p>
            </div>
          </div>
        </div>

        <!-- Courses Display -->
        <div v-if="filteredCourses.length > 0">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="course in filteredCourses" 
              :key="course.kod_subjek"
              class="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow"
            >
              <div class="p-4 border-b">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">{{ course.kod_subjek }}</h3>
                    <p class="text-sm text-gray-600">{{ course.nama_subjek || 'No description' }}</p>
                  </div>
                </div>
              </div>
              <div class="p-4">
                <p class="text-sm text-gray-700"><span class="font-medium">Sections:</span> {{ course.bil_seksyen }}</p>
                <p class="text-sm text-gray-700"><span class="font-medium">Lecturers:</span> {{ course.bil_pensyarah }}</p>
                <p class="text-sm text-gray-700"><span class="font-medium">Students:</span> {{ course.bil_pelajar }}</p>
              </div>
            </div>
          </div>
        </div>
        <!-- No Courses Found -->
        <div v-else-if="!loading && selectedPeriod" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
          <p class="text-gray-500">
            No courses found for {{ selectedPeriodLabel }}
          </p>
        </div>

        <!-- Initial State -->
        <div v-else-if="!loading" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Courses Offered</h3>
          <p class="text-gray-500">
            Select a session and semester to view courses offered
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
  name: 'CoursesOfferedView',
  components: { Sidebar },
  setup() {
    const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi'

    const sidebarOpen = ref(false)
    const loading = ref(false)
    const loadingPeriods = ref(false)

    // Selection states
    const selectedPeriod = ref('')
    const currentSession = ref('')
    const currentSemester = ref('')
    const availablePeriods = ref([])

    // Data arrays
    const courses = ref([])

    // UI states
    const searchQuery = ref('')

    // API functions
    async function fetchJSON(params) {
      const url = `${TTMS_API}?${new URLSearchParams(params)}`
      const res = await fetch(url)
      const json = await res.json()
      return json
    }

    async function loadCurrentPeriod() {
      try {
        const sessionCacheKey = 'current_session'
        const cachedSession = localStorage.getItem(sessionCacheKey)

        let sesData
        if (cachedSession) {
          sesData = JSON.parse(cachedSession)
        } else {
          const [sessionResponse] = await fetchJSON({ entity: 'sesisemester' })
          sesData = sessionResponse
          localStorage.setItem(sessionCacheKey, JSON.stringify(sesData))
        }

        currentSession.value = sesData.sesi
        currentSemester.value = sesData.semester
        selectedPeriod.value = `${currentSession.value}|${currentSemester.value}`
      } catch (err) {
        console.error('[CoursesOffered] Error loading current period:', err)
      }
    }

    function generatePeriods() {
      const periods = []
      const startYear = 2007
      // Parse current session and semester
      let [endYear1, endYear2] = currentSession.value.split('/').map(Number)
      let endSemester = Number(currentSemester.value)

      for (let y1 = startYear; y1 <= endYear1; y1++) {
        const sesi = `${y1}/${y1 + 1}`
        for (let sem = 1; sem <= 2; sem++) {
          // Do not go past current period
          if (
            (y1 > endYear1) ||
            (y1 === endYear1 && sem > endSemester)
          ) continue
          const value = `${sesi}|${sem}`
          const label = `Session ${sesi}, Semester ${sem}`
          const isCurrent = (sesi === currentSession.value && sem === endSemester)
          periods.push({ value, label, isCurrent })
        }
      }
      // Sort descending (latest first)
      periods.reverse()
      availablePeriods.value = periods
    }

    async function loadAvailablePeriods() {
      loadingPeriods.value = true
      try {
        generatePeriods()
      } catch (err) {
        console.error('[CoursesOffered] Error loading periods:', err)
        availablePeriods.value = []
      } finally {
        loadingPeriods.value = false
      }
    }

    async function loadCourses() {
      if (!selectedPeriod.value) return

      loading.value = true
      try {
        const [sesi, semester] = selectedPeriod.value.split('|')
        const cacheKey = `courses_${sesi}_${semester}`
        const cached = localStorage.getItem(cacheKey)

        if (cached) {
          const cachedData = JSON.parse(cached)
          const cacheAge = Date.now() - (cachedData.timestamp || 0)
          const cacheMaxAge = 30 * 60 * 1000 // 30 minutes

          if (cacheAge < cacheMaxAge) {
            courses.value = cachedData.courses
            return
          }
        }

        const coursesData = await fetchJSON({
          entity: 'subjek',
          sesi,
          semester
        })

        courses.value = coursesData

        // Cache with timestamp
        const dataToCache = {
          courses: coursesData,
          timestamp: Date.now()
        }
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache))
      } catch (err) {
        console.error('[CoursesOffered] Error loading courses:', err)
        courses.value = []
      } finally {
        loading.value = false
      }
    }

    // Event handlers
    function onPeriodChange() {
      courses.value = []
    }

    // Computed properties
    const filteredCourses = computed(() => {
      let filtered = courses.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(course =>
          (course.nama_subjek && course.nama_subjek.toLowerCase().includes(query)) ||
          (course.kod_subjek && course.kod_subjek.toLowerCase().includes(query))
        )
      }

      return filtered.sort((a, b) => {
        const codeA = a.kod_subjek || ''
        const codeB = b.kod_subjek || ''
        return codeA.localeCompare(codeB)
      })
    })

    const totalSections = computed(() => {
      return filteredCourses.value.reduce((sum, course) => sum + (course.bil_seksyen || 0), 0)
    })

    const totalStudents = computed(() => {
      return filteredCourses.value.reduce((sum, course) => sum + (course.bil_pelajar || 0), 0)
    })

    const selectedPeriodLabel = computed(() => {
      const found = availablePeriods.value.find(p => p.value === selectedPeriod.value)
      return found ? found.label : ''
    })

    const isCurrentPeriod = computed(() => {
      const found = availablePeriods.value.find(p => p.value === selectedPeriod.value)
      return found ? found.isCurrent : false
    })

    // Initialize
    async function initialize() {
      await loadCurrentPeriod()
      await loadAvailablePeriods()
    }

    onMounted(initialize)

    return {
      sidebarOpen, loading, loadingPeriods,
      selectedPeriod, currentSession, currentSemester,
      availablePeriods, courses, searchQuery,
      filteredCourses, totalSections, totalStudents,
      selectedPeriodLabel, isCurrentPeriod,
      onPeriodChange, loadCourses
    }
  }
}
</script>

<style scoped>
.transition-shadow {
  transition: box-shadow 0.2s ease-in-out;
}
</style>
