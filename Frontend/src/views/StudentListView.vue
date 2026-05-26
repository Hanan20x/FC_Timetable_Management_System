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
        <h1 class="text-xl font-semibold text-gray-800">Student List</h1>
        <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
          <img src="@/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full" />
        </div>
      </header>

      <main class="p-4 sm:p-6 bg-white flex-1">
        <!-- Session Selection -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Academic Sessions</h2>
          
          <!-- First Session (Always Visible) -->
          <div 
            v-if="availableSessions.length > 0"
            @click="selectSession(availableSessions[0])"
            class="py-2 px-3 cursor-pointer hover:bg-gray-100 flex items-center justify-between rounded"
            :class="{'bg-blue-50': isSelectedSession(availableSessions[0])}"
          >
            <div class="flex items-center">
              <span class="mr-2">▸</span>
              <span class="font-medium">
                {{ availableSessions[0].sesi }} {{ availableSessions[0].semester }}
                <span v-if="isCurrentSession(availableSessions[0])" class="text-sm text-green-600 ml-1">(Current)</span>
              </span>
            </div>
            <span v-if="isSelectedSession(availableSessions[0]) && studentsLoaded" class="text-sm text-gray-500">
              {{ students.length }} students
            </span>
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
                v-for="(session, index) in availableSessions.slice(1)" 
                :key="`${session.sesi}-${session.semester}`"
                @click="selectSession(session)"
                class="py-2 px-3 cursor-pointer hover:bg-gray-100 flex items-center justify-between rounded"
                :class="{'bg-blue-50': isSelectedSession(session)}"
              >
                <div class="flex items-center">
                  <span class="mr-2">▸</span>
                  <span class="font-medium">
                    {{ session.sesi }} {{ session.semester }}
                    <span v-if="isCurrentSession(session)" class="text-sm text-green-600 ml-1">(Current)</span>
                  </span>
                </div>
                <span v-if="isSelectedSession(session) && studentsLoaded" class="text-sm text-gray-500">
                  {{ students.length }} students
                </span>
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

        <!-- Students List -->
        <div v-else-if="studentsLoaded">
          <div class="mb-6 flex justify-between items-center">
            <h2 class="text-xl font-semibold">
              Students - {{ selectedSession.sesi }} (Semester {{ selectedSession.semester }})
            </h2>
            
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or matric number..."
                class="px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Students List -->
          <div v-if="filteredStudents.length > 0" class="space-y-4">
            <div 
              v-for="student in paginatedStudents" 
              :key="student.no_matrik"
              class="border border-gray-200 rounded-lg overflow-hidden"
            >
              <!-- Student Header -->
              <div 
                @click="toggleStudent(student)"
                class="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
              >
                <div class="flex items-center space-x-4">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-blue-600 font-semibold">
                      {{ getInitials(student.nama) }}
                    </span>
                  </div>
                  
                  <div>
                    <h3 class="font-semibold text-gray-800">{{ student.nama }}</h3>
                    <div class="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{{ student.no_matrik }}</span>
                      <span>{{ student.kod_kursus }}</span>
                      <span>Year {{ student.tahun_kursus }}</span>
                      <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {{ student.kod_fakulti }}
                      </span>
                      <span v-if="student.seksyen" class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Section {{ student.seksyen }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <svg 
                  :class="['w-5 h-5 text-gray-600 transition-transform', { 'rotate-180': expandedStudents[student.no_matrik] }]"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <!-- Expanded Student Details -->
              <div 
                v-show="expandedStudents[student.no_matrik]"
                class="border-t bg-gray-50 px-6 py-4"
              >
                <!-- Timeline Header -->
                <div class="flex items-center mb-4">
                  <svg class="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h4 class="text-lg font-medium text-blue-600">Timeline:</h4>
                </div>
                
                <!-- Loading Student History -->
                <div v-if="loadingHistory === student.no_matrik" class="flex justify-center py-4">
                  <svg class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                </div>
                
                <!-- Load History Button -->
                <div v-else-if="!studentHistory[student.no_matrik]" class="flex justify-center py-4">
                  <button
                    @click="loadStudentHistory(student)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Load Academic History
                  </button>
                </div>
                
                <!-- Timeline Content -->
                <div v-else class="border-l-2 border-gray-200 ml-2 pl-6 space-y-8">
                  <div 
                    v-for="(semester, index) in studentHistory[student.no_matrik]" 
                    :key="`${semester.session}-${semester.semester}`"
                    class="relative"
                  >
                    <!-- Timeline Dot -->
                    <div 
                      class="absolute -left-9 mt-1 w-4 h-4 rounded-full"
                      :class="getTimelineDotColor(index)"
                    ></div>
                    
                    <!-- Semester Header -->
                    <div class="flex items-center mb-2">
                      <h5 class="text-lg font-medium" :class="getTimelineTextColor(index)">
                        {{ semester.session }} | Semester {{ semester.semester }}
                      </h5>
                    </div>
                    
                    <!-- Subjects List -->
                    <ul class="space-y-2 mb-3">
                      <li 
                        v-for="subject in semester.subjects" 
                        :key="subject.kod_subjek"
                        class="flex items-start"
                      >
                        <span class="text-pink-500 mr-2">•</span>
                        <div>
                          <span class="text-pink-500">Subject: </span>
                          <span>{{ subject.kod_subjek }}</span>
                          <span v-if="subject.nama_subjek" class="text-sm text-gray-600 ml-1">
                            ({{ subject.nama_subjek }})
                          </span>
                          <span v-if="subject.seksyen" class="text-sm text-green-600 ml-1">
                            Section {{ subject.seksyen }}
                          </span>
                          <span v-if="subject.kredit" class="text-sm text-blue-600 ml-1">
                            {{ subject.kredit }} credits
                          </span>
                        </div>
                      </li>
                      
                      <li class="flex items-start">
                        <span class="text-pink-500 mr-2">•</span>
                        <div>
                          <span class="text-pink-500">Total Credit: </span>
                          <span>{{ semester.totalCredits }}</span>
                        </div>
                      </li>
                      
                      <!-- Timetable Controls -->
                      <li class="flex items-start">
                        <span class="text-pink-500 mr-2">•</span>
                        <div class="flex items-center">
                          <svg class="h-5 w-5 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          
                          <!-- Show View Button when timetable is hidden -->
                          <button
                            v-if="!studentTimetables[`${student.no_matrik}-${semester.session}-${semester.semester}`]"
                            @click="viewSemesterTimetable(student, semester)"
                            :disabled="loadingTimetable === `${student.no_matrik}-${semester.session}-${semester.semester}`"
                            class="text-green-600 hover:underline"
                          >
                            {{ loadingTimetable === `${student.no_matrik}-${semester.session}-${semester.semester}` ? 'Loading...' : 'View Timetable' }}
                          </button>
                        </div>
                      </li>
                    </ul>
                    
                    <!-- Timetable Display -->
                    <div 
                      v-if="studentTimetables[`${student.no_matrik}-${semester.session}-${semester.semester}`]" 
                      class="mt-2 bg-white rounded-lg border p-3"
                    >
                      <div class="flex justify-between items-center mb-2">
                        <h6 class="font-medium">Timetable</h6>
                        <button
                          @click="hideTimetable(student, semester)"
                          class="text-sm text-red-600 hover:underline"
                        >
                          Hide
                        </button>
                      </div>
                      
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
                            v-if="getDailySchedule(student, semester, selectedDay).length > 0"
                            class="space-y-2"
                          >
                            <div 
                              v-for="(classItem, idx) in getDailySchedule(student, semester, selectedDay)" 
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
                              <span class="font-medium ml-2">{{ getSubjectName(selectedClass.subject, semester) }}</span>
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
                          <table class="min-w-full text-xs">
                            <thead class="bg-gray-50">
                              <tr>
                                <th class="py-1 px-2 text-left text-gray-500">Time</th>
                                <th 
                                  v-for="day in displayDays" 
                                  :key="day"
                                  class="py-1 px-2 text-center text-gray-500"
                                >
                                  {{ day }}
                                </th>
                              </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                              <tr v-for="slot in timeSlots" :key="slot.key">
                                <td class="py-1 px-2 text-gray-600 font-medium">{{ slot.label }}</td>
                                <td 
                                  v-for="day in displayDays" 
                                  :key="day"
                                  class="py-1 px-2 text-center"
                                >
                                  <div 
                                    v-if="hasClass(student, semester, day, slot.key)"
                                    class="w-4 h-4 mx-auto rounded-full"
                                    :style="{
                                      backgroundColor: getSubjectColor(getClassSubject(student, semester, day, slot.key))
                                    }"
                                  ></div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Loading Timetable Indicator -->
                    <div v-else-if="loadingTimetable === `${student.no_matrik}-${semester.session}-${semester.semester}`" class="mt-2 flex justify-center py-2">
                      <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="filteredStudents.length > studentsPerPage" class="mt-6 flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing {{ ((currentPage - 1) * studentsPerPage) + 1 }} to {{ Math.min(currentPage * studentsPerPage, filteredStudents.length) }} of {{ filteredStudents.length }} students
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span class="px-3 py-1 text-sm">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>

          <!-- No Results -->
          <div v-if="studentsLoaded && filteredStudents.length === 0" class="text-center py-12">
            <svg class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-gray-500 text-lg font-medium">No students found</p>
            <p class="text-gray-400 mt-2">Try adjusting your search criteria</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import { ref, computed, onMounted, watch } from 'vue'

export default {
  name: 'StudentListView',
  components: { Sidebar },
  setup() {
    const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi'
    const ADMIN_AUTH_API = 'http://web.fc.utm.my/ttms/auth-admin.php'
    
    const sidebarOpen = ref(false)
    const loading = ref(false)
    const loadingHistory = ref(null)
    const loadingTimetable = ref(null)
    const studentsLoaded = ref(false)
    const students = ref([])
    const searchQuery = ref('')
    const expandedStudents = ref({})
    const studentHistory = ref({})
    const studentTimetables = ref({})
    const adminSessionId = ref('')
    const showAllSessions = ref(false)
    const selectedDay = ref('MON')
    const selectedClass = ref(null)
    
    // Session management
    const availableSessions = ref([])
    const selectedSession = ref({ sesi: '', semester: '' })
    
    // Pagination
    const currentPage = ref(1)
    const studentsPerPage = ref(20)

    // Color palette for subjects
    const subjectColors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
      '#14B8A6', '#F43F5E', '#8B5A2B', '#059669', '#7C3AED'
    ]
    const subjectColorMap = ref({})

    // Time slots and days
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

    const dayMap = { 1: 'SUN', 2: 'MON', 3: 'TUE', 4: 'WED', 5: 'THU', 6: 'FRI', 7: 'SAT' }

    // Timeline colors
    const timelineColors = [
      { dot: 'bg-green-400', text: 'text-green-600' },
      { dot: 'bg-yellow-400', text: 'text-yellow-600' },
      { dot: 'bg-blue-400', text: 'text-blue-600' },
      { dot: 'bg-purple-400', text: 'text-purple-600' },
      { dot: 'bg-pink-400', text: 'text-pink-600' },
      { dot: 'bg-indigo-400', text: 'text-indigo-600' }
    ]

    function getTimelineDotColor(index) {
      return timelineColors[index % timelineColors.length].dot
    }

    function getTimelineTextColor(index) {
      return timelineColors[index % timelineColors.length].text
    }

    function getSubjectColor(subjectCode) {
      if (!subjectColorMap.value[subjectCode]) {
        const colorIndex = Object.keys(subjectColorMap.value).length % subjectColors.length
        subjectColorMap.value[subjectCode] = subjectColors[colorIndex]
      }
      return subjectColorMap.value[subjectCode]
    }

    function getInitials(name) {
      if (!name) return 'NA'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    function isCurrentSession(session) {
      const currentYear = new Date().getFullYear()
      const sessionStartYear = parseInt(session.sesi.split('/')[0])
      return sessionStartYear === currentYear
    }

    function isSelectedSession(session) {
      return selectedSession.value.sesi === session.sesi && 
             selectedSession.value.semester === session.semester
    }
    
    function getTimeSlotLabel(slotKey) {
      return timeSlotsMap[slotKey] || `Slot ${slotKey}`
    }
    
    function getSubjectName(subjectCode, semester) {
      const subject = semester.subjects.find(s => s.kod_subjek === subjectCode)
      return subject?.nama_subjek || subjectCode
    }
    
    function hasClass(student, semester, day, slot) {
      const timetableKey = `${student.no_matrik}-${semester.session}-${semester.semester}`
      const timetable = studentTimetables.value[timetableKey]
      return timetable && timetable[day] && timetable[day][slot]
    }
    
    function getClassSubject(student, semester, day, slot) {
      const timetableKey = `${student.no_matrik}-${semester.session}-${semester.semester}`
      const timetable = studentTimetables.value[timetableKey]
      return timetable && timetable[day] && timetable[day][slot] ? timetable[day][slot].subject : ''
    }
    
    function getDailySchedule(student, semester, day) {
      const timetableKey = `${student.no_matrik}-${semester.session}-${semester.semester}`
      const timetable = studentTimetables.value[timetableKey]
      
      if (!timetable || !timetable[day]) return []
      
      const schedule = []
      
      for (const slot in timetable[day]) {
        schedule.push({
          slot,
          subject: timetable[day][slot].subject,
          venue: timetable[day][slot].venue,
          section: timetable[day][slot].section,
          lecturer: timetable[day][slot].lecturer || 'TBA'
        })
      }
      
      // Sort by time slot
      schedule.sort((a, b) => parseInt(a.slot) - parseInt(b.slot))
      
      return schedule
    }

    // Check if a semester is the current/latest one for a student
    function isCurrentSemester(semester, index) {
      // If it's the first semester in the history (index 0), it's the latest
      return index === 0
    }

    async function fetchJSON(url) {
      console.log('[StudentList] Fetching:', url)
      try {
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const json = await res.json()
        console.log('[StudentList] Response received')
        return json
      } catch (error) {
        console.error('[StudentList] Fetch error:', error)
        throw error
      }
    }

    // Generate sessions from 2007 to 2024/2025
    function generateAllSessions() {
      const sessions = []
      
      for (let year = 2007; year <= 2024; year++) {
        const sessionYear = `${year}/${year + 1}`
        
        // Add only 2 semesters for each academic year
        sessions.push({ sesi: sessionYear, semester: '2' })
        sessions.push({ sesi: sessionYear, semester: '1' })
      }
      
      // Sort in reverse chronological order (newest first)
      sessions.sort((a, b) => {
        const yearA = parseInt(a.sesi.split('/')[0])
        const yearB = parseInt(b.sesi.split('/')[0])
        if (yearA !== yearB) return yearB - yearA
        return parseInt(b.semester) - parseInt(a.semester)
      })
      
      return sessions
    }

    async function selectSession(session) {
      if (isSelectedSession(session)) return
      
      // Reset state
      selectedSession.value = session
      students.value = []
      studentsLoaded.value = false
      currentPage.value = 1
      expandedStudents.value = {}
      
      // Load students for selected session
      await loadStudentsForSession(session.sesi, session.semester)
    }

    async function loadStudentsForSession(session, semester) {
      console.log(`[StudentList] Loading students for ${session} semester ${semester}`)
      loading.value = true
      
      try {
        // Check for cached data first
        const cacheKey = `students_${session}_${semester}`
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const cachedData = JSON.parse(cached)
          students.value = cachedData.students
          studentsLoaded.value = true
          loading.value = false
          console.log('[StudentList] Loaded from cache')
          return
        }
        
        // Get admin session ID if not already available
        if (!adminSessionId.value) {
          const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession') || '{}')
          if (!loginData.session_id) {
            console.error('[StudentList] No login data')
            loading.value = false
            return
          }
          
          const adminAuthUrl = `${ADMIN_AUTH_API}?session_id=${loginData.session_id}`
          const [adminAuth] = await fetchJSON(adminAuthUrl)
          adminSessionId.value = adminAuth.session_id
          console.log('[StudentList] Admin session ID:', adminSessionId.value)
        }
        
        // Get students list with pagination
        const allStudents = []
        
        // First batch (offset 0)
        const studentsUrl1 = `${TTMS_API}?entity=pelajar&session_id=${adminSessionId.value}&sesi=${session}&semester=${semester}&limit=900&offset=0`
        const studentsData1 = await fetchJSON(studentsUrl1)
        allStudents.push(...studentsData1)
        
        // Second batch (offset 901)
        const studentsUrl2 = `${TTMS_API}?entity=pelajar&session_id=${adminSessionId.value}&sesi=${session}&semester=${semester}&limit=900&offset=901`
        const studentsData2 = await fetchJSON(studentsUrl2)
        allStudents.push(...studentsData2)
        
        // Remove duplicates based on no_matrik
        const uniqueStudents = []
        const matricSet = new Set()
        
        allStudents.forEach(student => {
          if (student.no_matrik && !matricSet.has(student.no_matrik)) {
            matricSet.add(student.no_matrik)
            uniqueStudents.push(student)
          }
        })
        
        students.value = uniqueStudents
        studentsLoaded.value = true

        // Cache the data
        const dataToCache = {
          students: uniqueStudents,
          timestamp: Date.now()
        }
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache))

        console.log('[StudentList] Students loaded:', uniqueStudents.length)
      } catch (err) {
        console.error(`[StudentList] Error loading students for ${session} semester ${semester}:`, err)
      } finally {
        loading.value = false
      }
    }

    async function loadStudentHistory(student) {
      console.log('[StudentList] Loading history for:', student.nama)
      loadingHistory.value = student.no_matrik
      
      try {
        // Check cache first
        const historyCacheKey = `student_history_${student.no_matrik}`
        const cachedHistory = localStorage.getItem(historyCacheKey)
        
        if (cachedHistory) {
          studentHistory.value[student.no_matrik] = JSON.parse(cachedHistory)
          console.log('[StudentList] Loaded history from cache')
          
          // Load timetable for the current/latest semester only
          if (studentHistory.value[student.no_matrik].length > 0) {
            const latestSemester = studentHistory.value[student.no_matrik][0]
            loadSemesterTimetable(student, latestSemester)
          }
          
          loadingHistory.value = null
          return
        }
        
        // Fetch student's enrollment history
        const historyUrl = `${TTMS_API}?entity=pelajar_subjek&no_matrik=${student.no_matrik}`
        const historyData = await fetchJSON(historyUrl)
        
        // Group by session and semester
        const semesterMap = {}
        
        historyData.forEach(item => {
          const key = `${item.sesi}-${item.semester}`
          
          if (!semesterMap[key]) {
            semesterMap[key] = {
              session: item.sesi,
              semester: item.semester,
              subjects: [],
              totalCredits: 0
            }
          }
          
          // Add subject to the semester
          semesterMap[key].subjects.push(item)
          
          // Add credits to total (ensure it's a number)
          const credits = parseInt(item.kredit) || 0
          semesterMap[key].totalCredits += credits
        })
        
        // Convert to array and sort by year and semester (newest first)
        const history = Object.values(semesterMap).sort((a, b) => {
          const yearA = parseInt(a.session.split('/')[0])
          const yearB = parseInt(b.session.split('/')[0])
          if (yearA !== yearB) return yearB - yearA
          return parseInt(b.semester) - parseInt(a.semester)
        })
        
        studentHistory.value[student.no_matrik] = history
        
        // Cache the history
        localStorage.setItem(historyCacheKey, JSON.stringify(history))
        
        console.log('[StudentList] History loaded for', student.nama, ':', history.length, 'semesters')
        
        // Load timetable for the current/latest semester only
        if (history.length > 0) {
          loadSemesterTimetable(student, history[0])
        }
        
      } catch (err) {
        console.error('[StudentList] Error loading history:', err)
      } finally {
        loadingHistory.value = null
      }
    }

    async function loadSemesterTimetable(student, semester) {
      const timetableKey = `${student.no_matrik}-${semester.session}-${semester.semester}`
      
      // Skip if already loaded or loading
      if (studentTimetables.value[timetableKey] || loadingTimetable.value === timetableKey) {
        return
      }
      
      loadingTimetable.value = timetableKey
      
      try {
        // Check cache first
        const timetableCacheKey = `student_timetable_${timetableKey}`
        const cachedTimetable = localStorage.getItem(timetableCacheKey)
        
        if (cachedTimetable) {
          studentTimetables.value[timetableKey] = JSON.parse(cachedTimetable)
          console.log('[StudentList] Loaded timetable from cache')
          loadingTimetable.value = null
          return
        }
        
        // Build timetable from subjects
        const timetableData = {}
        
        for (const subject of semester.subjects) {
          // Fetch schedule for each subject
          const scheduleUrl = `${TTMS_API}?entity=jadual_subjek&sesi=${semester.session}&semester=${semester.semester}&kod_subjek=${subject.kod_subjek}&seksyen=${subject.seksyen}`
          const scheduleList = await fetchJSON(scheduleUrl)
          
          for (const item of scheduleList) {
            if (!item.hari) continue
            
            const day = dayMap[item.hari]
            const slot = `${item.masa}`
            
            if (!timetableData[day]) timetableData[day] = {}
            timetableData[day][slot] = {
              subject: subject.kod_subjek,
              venue: item.ruang?.nama_ruang_singkatan || 'TBA',
              section: subject.seksyen,
              lecturer: item.pensyarah || 'TBA'
            }
          }
        }
        
        studentTimetables.value[timetableKey] = timetableData
        
        // Cache the timetable
        localStorage.setItem(timetableCacheKey, JSON.stringify(timetableData))
        
        console.log('[StudentList] Timetable loaded for', student.nama, 'semester', semester.semester)
        
      } catch (err) {
        console.error('[StudentList] Error loading timetable:', err)
      } finally {
        loadingTimetable.value = null
      }
    }

    function viewSemesterTimetable(student, semester) {
      loadSemesterTimetable(student, semester)
    }

    function hideTimetable(student, semester) {
      const timetableKey = `${student.no_matrik}-${semester.session}-${semester.semester}`
      delete studentTimetables.value[timetableKey]
    }

    function toggleStudent(student) {
      const isExpanding = !expandedStudents.value[student.no_matrik]
      expandedStudents.value[student.no_matrik] = isExpanding
      
      // Load student history when expanding if not already loaded
      if (isExpanding && !studentHistory.value[student.no_matrik] && !loadingHistory.value) {
        loadStudentHistory(student)
      }
    }

    // Computed properties
    const filteredStudents = computed(() => {
      if (!searchQuery.value.trim()) return students.value
      
      const query = searchQuery.value.toLowerCase().trim()
      return students.value.filter(student => 
        (student.nama?.toLowerCase().includes(query)) ||
        (student.no_matrik?.toLowerCase().includes(query))
      )
    })

    const paginatedStudents = computed(() => {
      const start = (currentPage.value - 1) * studentsPerPage.value
      const end = start + studentsPerPage.value
      return filteredStudents.value.slice(start, end)
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredStudents.value.length / studentsPerPage.value)
    })

    // Reset pagination when search query changes
    watch(searchQuery, () => {
      currentPage.value = 1
    })

    // Initialize on mount
    onMounted(() => {
      // Generate all sessions
      availableSessions.value = generateAllSessions()
      
      // Try to get admin session ID
      const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession') || '{}')
      if (loginData.session_id) {
        // Get admin session ID
        const adminAuthUrl = `${ADMIN_AUTH_API}?session_id=${loginData.session_id}`
        fetchJSON(adminAuthUrl).then(([adminAuth]) => {
          adminSessionId.value = adminAuth.session_id
          console.log('[StudentList] Admin session ID initialized:', adminSessionId.value)
        }).catch(err => {
          console.error('[StudentList] Error initializing admin session:', err)
        })
      }
    })

    return {
      sidebarOpen,
      loading,
      loadingHistory,
      loadingTimetable,
      studentsLoaded,
      students,
      searchQuery,
      expandedStudents,
      studentHistory,
      studentTimetables,
      currentPage,
      studentsPerPage,
      filteredStudents,
      paginatedStudents,
      totalPages,
      displayDays,
      timeSlots,
      timeSlotsMap,
      availableSessions,
      selectedSession,
      showAllSessions,
      selectedDay,
      selectedClass,
      selectSession,
      isSelectedSession,
      isCurrentSession,
      loadStudentHistory,
      viewSemesterTimetable,
      hideTimetable,
      toggleStudent,
      getSubjectColor,
      getInitials,
      getTimelineDotColor,
      getTimelineTextColor,
      getTimeSlotLabel,
      getSubjectName,
      hasClass,
      getClassSubject,
      getDailySchedule
    }
  }
}
</script>