<template>
  <div class="relative min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar :open="sidebarOpen" @update:open="val => sidebarOpen = val" />

    <!-- Main content -->
    <div class="flex flex-col">
      <!-- Top Bar -->
      <header class="flex items-center justify-between p-4 bg-white shadow">
        <button @click="sidebarOpen = true" class="p-2">
          <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-xl font-semibold text-gray-800">More</h1>
        <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
          <img src="@/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full"
            onerror="this.style.display='none'" />
        </div>
      </header>

      <!-- More List -->
      <main class="p-4 sm:p-6 bg-white flex-1">
        <h2 class="text-lg font-semibold mb-4">Tools & Features</h2>

        <div class="space-y-3">
          <router-link
            to="/facultycourses"
            class="flex items-center space-x-3 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm"
          >
            <BookOpenIcon class="w-6 h-6 text-blue-600" />
            <span class="text-gray-800 font-medium">Faculty Courses</span>
          </router-link>

          <router-link
            to="/lecturer-schedule"
            class="flex items-center space-x-3 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm"
          >
            <UserGroupIcon class="w-6 h-6 text-green-600" />
            <span class="text-gray-800 font-medium">Lecturer Schedule</span>
          </router-link>

          <router-link
            to="/students-by-section"
            class="flex items-center space-x-3 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm"
          >
            <AcademicCapIcon class="w-6 h-6 text-yellow-600" />
            <span class="text-gray-800 font-medium">Students by Section</span>
          </router-link>

          <router-link
            to="/room-availability"
            class="flex items-center space-x-3 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm"
          >
            <BuildingLibraryIcon class="w-6 h-6 text-purple-600" />
            <span class="text-gray-800 font-medium">Room Availability</span>
          </router-link>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import { ref } from 'vue'
import {
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingLibraryIcon
} from '@heroicons/vue/24/solid'

export default {
  name: 'MoreView',
  components: {
    Sidebar,
    BookOpenIcon,
    UserGroupIcon,
    AcademicCapIcon,
    BuildingLibraryIcon
  },
  setup() {
    const sidebarOpen = ref(false)
    return { sidebarOpen }
  }
}
</script>

<style scoped>
</style>
