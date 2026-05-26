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
        <h1 class="text-xl font-semibold text-gray-800">Room-Based Timetable Analysis</h1>
        <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
          <img src="@/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full" />
        </div>
      </header>

      <main class="p-4 sm:p-6 bg-white flex-1">
        <!-- Step 1: Academic Period & Faculty Selection -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 class="text-lg font-medium mb-4 text-gray-800">Step 1: Select Academic Period & Faculty</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Academic Period</label>
              <select
                v-model="selectedPeriod"
                @change="onPeriodChange"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Academic Period</option>
                <option 
                  v-for="period in availablePeriods" 
                  :key="period.value" 
                  :value="period.value"
                  :class="period.isCurrent ? 'font-bold bg-blue-50' : ''"
                >
                  {{ period.label }} {{ period.isCurrent ? '(Current)' : '' }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
              <select
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
                :disabled="!selectedPeriod || !selectedFaculty || loading"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {{ loading ? 'Loading...' : 'Load Rooms' }}
              </button>
            </div>
          </div>
          
          <!-- Current Selection Display -->
          <div v-if="selectedPeriod && selectedFaculty" class="mt-4 p-3 bg-blue-50 rounded-md">
            <p class="text-sm text-blue-800">
              <span class="font-medium">Viewing:</span> 
              {{ selectedFaculty }} Rooms - {{ getPeriodLabel(selectedPeriod) }}
              <span v-if="isCurrentPeriod(selectedPeriod)" class="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Current Period
              </span>
            </p>
          </div>
        </div>

        <!-- Step 2: Room Selection -->
        <div v-if="rooms.length > 0" class="mb-6 p-4 bg-blue-50 rounded-lg border">
          <h3 class="text-lg font-medium mb-4 text-gray-800">Step 2: Select Room for Analysis</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Search & Select Room</label>
              <div class="relative">
                <input
                  v-model="roomSearchQuery"
                  @input="filterRooms"
                  type="text"
                  placeholder="Search rooms by name or code..."
                  class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <!-- Room Selection Dropdown -->
              <div v-if="filteredRooms.length > 0 && roomSearchQuery" class="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md bg-white shadow-lg">
                <div
                  v-for="room in filteredRooms.slice(0, 10)"
                  :key="room.kod_ruang"
                  @click="selectRoom(room)"
                  class="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div class="font-medium text-gray-800">{{ room.nama_ruang_singkatan || room.kod_ruang }}</div>
                  <div class="text-sm text-gray-600">{{ room.nama_ruang || 'No description' }}</div>
                  <div class="text-xs text-blue-600">{{ room.kod_ruang }}</div>
                </div>
              </div>
            </div>
            
            <div v-if="selectedRoom">
              <div class="p-3 bg-white rounded-lg border border-blue-200">
                <div class="font-medium text-gray-800">Selected: {{ selectedRoom.nama_ruang_singkatan || selectedRoom.kod_ruang }}</div>
                <div class="text-sm text-gray-600">{{ selectedRoom.nama_ruang || 'No description' }}</div>
                <div class="text-xs text-blue-600">{{ selectedRoom.kod_ruang }}</div>
                <button
                  @click="loadRoomSchedule"
                  :disabled="loadingRoomSchedule"
                  class="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ loadingRoomSchedule ? 'Loading...' : 'Load Schedule' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Time Slot Selection & Analysis -->
        <div v-if="selectedRoom && roomScheduleLoaded" class="mb-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Available Time Slots -->
            <div class="p-4 bg-green-50 rounded-lg border">
              <h3 class="text-lg font-medium mb-4 text-gray-800">Step 3: Select Available Time Slots</h3>
              
              <!-- Day Selection -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Select Day</label>
                <div class="grid grid-cols-5 gap-2">
                  <button
                    v-for="day in displayDays"
                    :key="day"
                    @click="selectedDay = day"
                    :class="[
                      'px-3 py-2 text-sm rounded-md font-medium',
                      selectedDay === day
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    ]"
                  >
                    {{ day }}
                  </button>
                </div>
              </div>

              <!-- Available Time Slots for Selected Day -->
              <div v-if="selectedDay">
                <h4 class="font-medium text-gray-700 mb-3">Available Time Slots for {{ selectedDay }}</h4>
                <div class="space-y-2 max-h-80 overflow-y-auto">
                  <div
                    v-for="slot in getAvailableSlots(selectedDay)"
                    :key="slot.key"
                    @click="toggleTimeSlot(slot)"
                    :class="[
                      'p-3 rounded-lg cursor-pointer border-2 transition-colors',
                      selectedTimeSlots.some(s => s.key === slot.key && s.day === selectedDay)
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    ]"
                  >
                    <div class="flex justify-between items-center">
                      <span class="font-medium">{{ slot.label }}</span>
                      <span v-if="selectedTimeSlots.some(s => s.key === slot.key && s.day === selectedDay)" class="text-blue-600">
                        ✓ Selected
                      </span>
                    </div>
                  </div>
                </div>
                
                <div v-if="getAvailableSlots(selectedDay).length === 0" class="text-center py-4 text-gray-500">
                  No available time slots for {{ selectedDay }}
                </div>
              </div>
            </div>

            <!-- Current Room Schedule -->
            <div class="p-4 bg-gray-50 rounded-lg border">
              <h3 class="text-lg font-medium mb-4 text-gray-800">Current Room Schedule</h3>
              
              <!-- Weekly Schedule Grid -->
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="py-2 px-3 text-left text-gray-600">Time</th>
                      <th v-for="day in displayDays" :key="day" class="py-2 px-3 text-center text-gray-600">
                        {{ day }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="slot in timeSlots" :key="slot.key">
                      <td class="py-2 px-3 text-gray-700 font-medium">{{ slot.label }}</td>
                      <td v-for="day in displayDays" :key="day" class="py-2 px-3 text-center">
                        <div
                          v-if="roomTimetable[day] && roomTimetable[day][slot.key]"
                          class="p-2 bg-red-100 text-red-800 rounded text-xs"
                          :title="roomTimetable[day][slot.key].subject || 'Occupied'"
                        >
                          <div class="font-medium">{{ roomTimetable[day][slot.key].subject || 'Occupied' }}</div>
                        </div>
                        <div
                          v-else-if="selectedTimeSlots.some(s => s.key === slot.key && s.day === day)"
                          class="p-2 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                        >
                          Selected
                        </div>
                        <div v-else class="p-2 text-gray-400 text-xs">
                          Free
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Analysis Results -->
        <div v-if="selectedTimeSlots.length > 0" class="space-y-6">
          <div class="p-4 bg-purple-50 rounded-lg border">
            <h3 class="text-lg font-medium mb-4 text-gray-800">Step 4: Analysis Results</h3>
            
            <!-- Selected Summary -->
            <div class="mb-6 p-4 bg-white rounded-lg border">
              <h4 class="font-medium text-gray-700 mb-3">Selection Summary</h4>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="text-center p-3 bg-blue-50 rounded">
                  <div class="text-xl font-bold text-blue-600">{{ selectedRoom.nama_ruang_singkatan || selectedRoom.kod_ruang }}</div>
                  <div class="text-sm text-gray-600">Selected Room</div>
                </div>
                <div class="text-center p-3 bg-green-50 rounded">
                  <div class="text-xl font-bold text-green-600">{{ selectedTimeSlots.length }}</div>
                  <div class="text-sm text-gray-600">Time Slots Selected</div>
                </div>
                <div class="text-center p-3 bg-purple-50 rounded">
                  <div class="text-xl font-bold text-purple-600">{{ getTotalHours() }}</div>
                  <div class="text-sm text-gray-600">Total Hours</div>
                </div>
                <div class="text-center p-3 bg-yellow-50 rounded">
                  <div class="text-xl font-bold text-yellow-600">{{ getPeriodLabel(selectedPeriod) }}</div>
                  <div class="text-sm text-gray-600">Academic Period</div>
                </div>
              </div>
            </div>

            <!-- Analysis Tabs -->
            <div class="border-b border-gray-200 mb-4">
              <nav class="-mb-px flex space-x-8">
                <button
                  v-for="tab in analysisTabs"
                  :key="tab.id"
                  @click="activeAnalysisTab = tab.id"
                  :class="[
                    'py-2 px-1 border-b-2 font-medium text-sm',
                    activeAnalysisTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  {{ tab.name }}
                </button>
              </nav>
            </div>

            <!-- Tab Content -->
            <div class="mt-4">
              <!-- Conflict Analysis -->
              <div v-if="activeAnalysisTab === 'conflicts'" class="space-y-4">
                <h4 class="font-medium text-gray-800">Potential Scheduling Conflicts</h4>
                <button
                  @click="analyzeConflicts"
                  :disabled="analyzingConflicts"
                  class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {{ analyzingConflicts ? 'Analyzing...' : 'Check for Conflicts' }}
                </button>

                <div v-if="conflictAnalysis.length > 0" class="space-y-3">
                  <!-- ... (existing conflict display) ... -->
                </div>
                <div v-else-if="conflictAnalysis.length === 0 && conflictAnalysisRun" class="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div class="flex items-center space-x-2">
                    <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="text-green-800">No conflicts detected for selected time slots</span>
                  </div>
                </div>

                <!-- Add the chart here if you create conflictChartData -->
                <div v-if="conflictChartData" class="mt-6 p-4 bg-white border rounded-lg">
                    <h5 class="font-medium text-gray-700 mb-3">Conflict Summary Chart</h5>
                    <Bar :data="conflictChartData" :options="{ responsive: true, maintainAspectRatio: false }" />
                </div>
              </div>

              <!-- Utilization Analysis -->
              <div v-if="activeAnalysisTab === 'utilization'" class="space-y-4">
                <h4 class="font-medium text-gray-800">Room Utilization Analysis</h4>
                <button
                  @click="analyzeUtilization"
                  :disabled="analyzingUtilization"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ analyzingUtilization ? 'Analyzing...' : 'Analyze Utilization' }}
                </button>
                
                <div v-if="utilizationAnalysis" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="p-4 bg-white border rounded-lg">
                    <h5 class="font-medium text-gray-700 mb-3">Current Utilization</h5>
                    <div class="space-y-2">
                      <div class="flex justify-between">
                        <span>Total Available Slots:</span>
                        <span class="font-medium">{{ utilizationAnalysis.totalSlots }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Currently Occupied:</span>
                        <span class="font-medium text-red-600">{{ utilizationAnalysis.occupiedSlots }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Available Slots:</span>
                        <span class="font-medium text-green-600">{{ utilizationAnalysis.availableSlots }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Utilization Rate:</span>
                        <span class="font-medium text-blue-600">{{ utilizationAnalysis.utilizationRate }}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="p-4 bg-white border rounded-lg">
                    <h5 class="font-medium text-gray-700 mb-3">With Selected Slots</h5>
                    <div class="space-y-2">
                      <div class="flex justify-between">
                        <span>Selected Slots:</span>
                        <span class="font-medium text-purple-600">{{ selectedTimeSlots.length }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>New Utilization:</span>
                        <span class="font-medium text-purple-600">{{ utilizationAnalysis.newUtilizationRate }}%</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Remaining Available:</span>
                        <span class="font-medium text-green-600">{{ utilizationAnalysis.remainingAvailable }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add the chart here -->
              <div v-if="utilizationChartData" class="mt-6 p-4 bg-white border rounded-lg">
                <h5 class="font-medium text-gray-700 mb-3">Utilization Chart</h5>
                <Bar :data="utilizationChartData" :options="{ responsive: true, maintainAspectRatio: false }" />
              </div>

              <!-- Optimization Suggestions -->
              <div v-if="activeAnalysisTab === 'optimization'" class="space-y-4">
                <h4 class="font-medium text-gray-800">Optimization Suggestions</h4>
                <button
                  @click="generateOptimizations"
                  :disabled="generatingOptimizations"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {{ generatingOptimizations ? 'Generating...' : 'Generate Suggestions' }}
                </button>
                
                <div v-if="optimizationSuggestions.length > 0" class="space-y-3">
                  <div
                    v-for="suggestion in optimizationSuggestions"
                    :key="suggestion.id"
                    class="p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div class="flex items-start space-x-3">
                      <svg class="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <div>
                        <h5 class="font-medium text-green-800">{{ suggestion.title }}</h5>
                        <p class="text-sm text-green-700 mt-1">{{ suggestion.description }}</p>
                        <div v-if="suggestion.impact" class="text-xs text-green-600 mt-2">
                          <strong>Impact:</strong> {{ suggestion.impact }}
                        </div>
                      </div>
                    </div>
                  </div>
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

        <!-- Initial State -->
        <div v-else-if="!selectedPeriod || !selectedFaculty" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Room-Based Analysis</h3>
          <p class="text-gray-500">
            Select academic period and faculty to begin room-based timetable analysis
          </p>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
// Register the necessary Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'ModifiedAnalysisView',
  components: { Sidebar, Bar },
  setup() {
    const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi'
    
    const sidebarOpen = ref(false)
    const loading = ref(false)
    const loadingRoomSchedule = ref(false)
    const analyzingConflicts = ref(false)
    const analyzingUtilization = ref(false)
    const generatingOptimizations = ref(false)
    
    // Step 1: Academic Period & Faculty
    const selectedPeriod = ref('')
    const selectedFaculty = ref('')
    const currentPeriod = ref('2025/2026-1') // Current academic period
    
    // Step 2: Room Selection
    const rooms = ref([])
    const roomSearchQuery = ref('')
    const filteredRooms = ref([])
    const selectedRoom = ref(null)
    const roomScheduleLoaded = ref(false)
    const roomTimetable = ref({})
    
    // Step 3: Time Selection
    const selectedDay = ref('')
    const selectedTimeSlots = ref([])
    
    // Step 4: Analysis
    const activeAnalysisTab = ref('conflicts')
    const conflictAnalysis = ref([])
    const conflictAnalysisRun = ref(false)
    const utilizationAnalysis = ref(null)
    const optimizationSuggestions = ref([])
    const utilizationChartData = ref(null); // Added chart data
    const conflictChartData = ref(null); // Added chart data
    
    const analysisTabs = [
      { id: 'conflicts', name: 'Conflict Analysis' },
      { id: 'utilization', name: 'Utilization Analysis' },
      { id: 'optimization', name: 'Optimization' }
    ]

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

    const displayDays = ['MON', 'TUE', 'WED', 'THU', 'FRI']
    const dayMap = { 1: 'SUN', 2: 'MON', 3: 'TUE', 4: 'WED', 5: 'THU', 6: 'FRI', 7: 'SAT' }

    // Generate available periods from 2007/2008-1 to 2025/2026-1
    const availablePeriods = computed(() => {
      const periods = []
      const startYear = 2007
      const endYear = 2025
      
      for (let year = startYear; year <= endYear; year++) {
        const nextYear = year + 1
        const session = `${year}/${nextYear}`
        
        // Add semester 1 and 2 for each session
        periods.push({
          value: `${session}-1`,
          label: `${session} Semester 1`,
          session: session,
          semester: '1',
          isCurrent: `${session}-1` === currentPeriod.value
        })
        
        periods.push({
          value: `${session}-2`,
          label: `${session} Semester 2`,
          session: session,
          semester: '2',
          isCurrent: `${session}-2` === currentPeriod.value
        })
      }
      
      // Sort in descending order (newest first)
      return periods.reverse()
    })

    // Helper functions for period handling
    function parsePeriod(periodValue) {
      if (!periodValue) return { session: '', semester: '' }
      const [session, semester] = periodValue.split('-')
      return { session, semester }
    }

    function getPeriodLabel(periodValue) {
      const period = availablePeriods.value.find(p => p.value === periodValue)
      return period ? period.label : periodValue
    }

    function isCurrentPeriod(periodValue) {
      return periodValue === currentPeriod.value
    }

    async function fetchJSON(url) {
      console.log('[ModifiedAnalysis] Fetching:', url)
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const json = await res.json()
        console.log('[ModifiedAnalysis] Response received')
        return json
      } catch (error) {
        console.error('[ModifiedAnalysis] Fetch error:', error)
        throw error
      }
    }

    // Step 1 Functions
    async function loadRooms() {
      if (!selectedPeriod.value || !selectedFaculty.value) return
      
      loading.value = true
      try {
        const roomsUrl = `${TTMS_API}?entity=ruang&kod_fakulti=${selectedFaculty.value}`
        const roomsData = await fetchJSON(roomsUrl)
        rooms.value = roomsData
        console.log('[ModifiedAnalysis] Loaded rooms:', roomsData.length)
      } catch (err) {
        console.error('[ModifiedAnalysis] Error loading rooms:', err)
        rooms.value = []
      } finally {
        loading.value = false
      }
    }

    function onPeriodChange() {
      selectedFaculty.value = ''
      rooms.value = []
      resetSelection()
    }

    function onFacultyChange() {
      rooms.value = []
      resetSelection()
    }

    // Step 2 Functions
    function filterRooms() {
      if (!roomSearchQuery.value) {
        filteredRooms.value = []
        return
      }
      
      const query = roomSearchQuery.value.toLowerCase()
      filteredRooms.value = rooms.value.filter(room => 
        (room.nama_ruang && room.nama_ruang.toLowerCase().includes(query)) ||
        (room.nama_ruang_singkatan && room.nama_ruang_singkatan.toLowerCase().includes(query)) ||
        (room.kod_ruang && room.kod_ruang.toLowerCase().includes(query))
      )
    }

    function selectRoom(room) {
      selectedRoom.value = room
      roomSearchQuery.value = room.nama_ruang_singkatan || room.kod_ruang
      filteredRooms.value = []
      roomScheduleLoaded.value = false
      selectedTimeSlots.value = []
      selectedDay.value = ''
    }

    async function loadRoomSchedule() {
      if (!selectedRoom.value || !selectedPeriod.value) return
      
      const { session, semester } = parsePeriod(selectedPeriod.value)
      
      loadingRoomSchedule.value = true
      try {
        const scheduleUrl = `${TTMS_API}?entity=jadual_ruang&sesi=${session}&semester=${semester}&kod_ruang=${selectedRoom.value.kod_ruang}`
        const scheduleData = await fetchJSON(scheduleUrl)
        
        // Process schedule data into timetable format
        const timetableData = {}
        
        for (const item of scheduleData) {
          const day = dayMap[item.hari]
          const slot = `${item.masa}`
          
          if (!timetableData[day]) timetableData[day] = {}
          timetableData[day][slot] = {
            subject: item.kod_subjek || 'Occupied',
            lecturer: item.pensyarah || 'TBA'
          }
        }
        
        roomTimetable.value = timetableData
        roomScheduleLoaded.value = true
        selectedDay.value = displayDays[0] // Auto-select first day
        
        console.log('[ModifiedAnalysis] Room schedule loaded')
      } catch (err) {
        console.error('[ModifiedAnalysis] Error loading room schedule:', err)
        roomTimetable.value = {}
        roomScheduleLoaded.value = true
      } finally {
        loadingRoomSchedule.value = false
      }
    }

    // Step 3 Functions
    function getAvailableSlots(day) {
      if (!roomTimetable.value[day]) {
        return timeSlots
      }
      
      return timeSlots.filter(slot => !roomTimetable.value[day][slot.key])
    }

    function toggleTimeSlot(slot) {
      const existingIndex = selectedTimeSlots.value.findIndex(
        s => s.key === slot.key && s.day === selectedDay.value
      )
      
      if (existingIndex >= 0) {
        selectedTimeSlots.value.splice(existingIndex, 1)
      } else {
        selectedTimeSlots.value.push({
          ...slot,
          day: selectedDay.value
        })
      }
    }

    function getTotalHours() {
      return selectedTimeSlots.value.length
    }

    // Step 4 Analysis Functions
    async function analyzeConflicts() {
        analyzingConflicts.value = true;
        conflictAnalysis.value = [];
        conflictAnalysisRun.value = false;
        conflictChartData.value = null;

        const { session, semester } = parsePeriod(selectedPeriod.value);
        const roomCode = selectedRoom.value.kod_ruang;
        const selectedSlots = selectedTimeSlots.value;

        try {
            const response = await fetch('http://web.fc.utm.my/ttms/web_man_webservice_json.cgi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sesi: session,
                    semester: semester,
                    roomCode: roomCode,
                    selectedSlots: selectedSlots
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const conflicts = await response.json();

            conflictAnalysis.value = conflicts;

            const conflictCountsByDay = {};
            displayDays.forEach(day => conflictCountsByDay[day] = 0);
            conflicts.forEach(conflict => {
                const day = conflict.day;
                if (conflictCountsByDay.hasOwnProperty(day)) {
                    conflictCountsByDay[day]++;
                }
            });

          conflictChartData.value = {
              labels: displayDays,
              datasets: [
                  {
                      label: 'Conflicts per Day',
                      backgroundColor: '#f87979',
                      data: displayDays.map(day => conflictCountsByDay[day])
                  }
              ]
          };
          conflictAnalysisRun.value = true;

        } catch (err) {
            console.error('[ModifiedAnalysis] Error fetching conflict data:', err);
        } finally {
            analyzingConflicts.value = false;
        }
    }

    async function analyzeUtilization() {
      analyzingUtilization.value = true;
      utilizationAnalysis.value = null;
      utilizationChartData.value = null;

      const { session, semester } = parsePeriod(selectedPeriod.value);
      const roomCode = selectedRoom.value.kod_ruang;

      try {
        const response = await fetch(`http://web.fc.utm.my/ttms/web_man_webservice_json.cgi?sesi=${session}&semester=${semester}&roomCode=${roomCode}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const analysisData = await response.json();

        // Store the analysis data
        utilizationAnalysis.value = analysisData;

        // Prepare data for the utilization chart
        if (analysisData) {
            utilizationChartData.value = {
                labels: ['Occupied Slots', 'Available Slots', 'Selected Slots', 'Remaining Available'], // Static labels for the chart
                datasets: [
                    {
                        label: 'Room Utilization',
                        backgroundColor: ['#f87979', '#41B883', '#a020f0', '#36A2EB'],
                        data: [
                            analysisData.occupiedSlots,
                            analysisData.availableSlots,
                            selectedTimeSlots.value.length,
                            analysisData.remainingAvailable
                        ]
                    }
                ]
            };
        }


      } catch (err) {
        console.error('[ModifiedAnalysis] Error fetching utilization data:', err);
      } finally {
        analyzingUtilization.value = false;
      }
    }

    async function generateOptimizations() {
      generatingOptimizations.value = true
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1200))
        
        const suggestions = [
          {
            id: 1,
            title: 'Optimize Time Block Grouping',
            description: 'Consider grouping selected time slots into consecutive blocks to improve room utilization efficiency.',
            impact: 'Could improve scheduling efficiency by 15-20%'
          },
          {
            id: 2,
            title: 'Peak Hour Distribution',
            description: 'Some selected slots are during peak hours. Consider distributing across off-peak times if possible.',
            impact: 'Reduces congestion and improves resource allocation'
          },
          {
            id: 3,
            title: 'Alternative Room Suggestions',
            description: 'Similar rooms with better availability patterns have been identified for comparison.',
            impact: 'Potential for better scheduling flexibility'
          }
        ]
        
        optimizationSuggestions.value = suggestions
        
      } catch (err) {
        console.error('[ModifiedAnalysis] Error generating optimizations:', err)
      } finally {
        generatingOptimizations.value = false
      }
    }

    function resetSelection() {
      selectedRoom.value = null
      roomSearchQuery.value = ''
      filteredRooms.value = []
      roomScheduleLoaded.value = false
      roomTimetable.value = {}
      selectedDay.value = ''
      selectedTimeSlots.value = []
      conflictAnalysis.value = []
      conflictAnalysisRun.value = false
      utilizationAnalysis.value = null
      optimizationSuggestions.value = []
    }

    onMounted(() => {
      selectedPeriod.value = currentPeriod.value // Set to current period
      selectedFaculty.value = 'FSKSM' // Default faculty
    })

    return {
      sidebarOpen,
      loading,
      loadingRoomSchedule,
      analyzingConflicts,
      analyzingUtilization,
      generatingOptimizations,
      availablePeriods,
      selectedPeriod,
      selectedFaculty,
      currentPeriod,
      rooms,
      roomSearchQuery,
      filteredRooms,
      selectedRoom,
      roomScheduleLoaded,
      roomTimetable,
      selectedDay,
      selectedTimeSlots,
      activeAnalysisTab,
      analysisTabs,
      conflictAnalysis,
      conflictAnalysisRun,
      utilizationAnalysis,
      optimizationSuggestions,
      displayDays,
      timeSlots,
      loadRooms,
      onPeriodChange,
      onFacultyChange,
      filterRooms,
      selectRoom,
      loadRoomSchedule,
      getAvailableSlots,
      toggleTimeSlot,
      getTotalHours,
      analyzeConflicts,
      analyzeUtilization,
      generateOptimizations,
      getPeriodLabel,
      isCurrentPeriod,
      utilizationChartData,
      conflictChartData, 
    }
  }
}
</script>
