<template>
  <!-- Backdrop -->
  <div 
    v-if="open" 
    class="fixed inset-0 z-20" 
    @click="$emit('update:open', false)"
  ></div>

  <transition name="slide">
    <aside
      v-if="open"
      class="fixed inset-y-0 left-0 z-30 bg-white shadow-lg overflow-auto
             transform transition-transform duration-300
             w-3/4 md:w-64
             flex flex-col justify-between"
      @click.stop
    >
      <!-- Header -->
      <div>
        <div class="flex items-center justify-between p-4 border-b">
          <img src="@/assets/logo.png" alt="FC-UTM" class="w-8 h-8"/>
          <div class="flex items-center space-x-2">
            <img src="@/assets/user-avatar.jpg" alt="Avatar" class="w-8 h-8 rounded-full"/>
            <button 
              class="md:hidden p-1 rounded hover:bg-gray-200" 
              @click="$emit('update:open', false)"
            >
              <XMarkIcon class="w-6 h-6 text-gray-700"/>
            </button>
          </div>
        </div>

        <!-- Menu items -->
        <nav class="p-2 space-y-1">
          <router-link
            to="/dashboard"
            class="flex items-center p-2 rounded hover:bg-gray-100"
            @click="$emit('update:open', false)"
          >
            <HomeIcon class="w-6 h-6"/>
            <span class="ml-3">Dashboard</span>
          </router-link>

          <router-link
            to="/mycourses"
            class="flex items-center p-2 rounded hover:bg-gray-100"
            @click="$emit('update:open', false)"
          >
            <BookOpenIcon class="w-6 h-6"/>
            <span class="ml-3">My Courses</span>
          </router-link>

          <router-link
            to="/timetable"
            class="flex items-center p-2 rounded hover:bg-gray-100"
            @click="$emit('update:open', false)"
          >
            <CalendarIcon class="w-6 h-6"/>
            <span class="ml-3">Timetable</span>
          </router-link>

          <router-link
            to="/profile"
            class="flex items-center p-2 rounded hover:bg-gray-100"
            @click="$emit('update:open', false)"
          >
            <UserIcon class="w-6 h-6"/>
            <span class="ml-3">Profile</span>
          </router-link>

          <router-link
            to="/analytics"
            class="flex items-center p-2 rounded hover:bg-gray-100"
            @click="$emit('update:open', false)"
          >
            <ChartBarIcon class="w-6 h-6"/>
            <span class="ml-3">Analytics</span>
          </router-link>

          <!-- More Section with Submenu -->
          <div>
            <button
              @click="toggleMore"
              class="flex items-center w-full p-2 rounded hover:bg-gray-100"
            >
              <EllipsisVerticalIcon class="w-6 h-6"/>
              <span class="ml-3">More</span>
              <ChevronDownIcon 
                class="w-5 h-5 ml-auto transition-transform"
                :class="{ 'rotate-180': isMoreOpen }"
              />
            </button>
            <div 
              v-show="isMoreOpen"
              class="ml-6 space-y-1"
            >
              <router-link
                to="/facultycourses"
                class="flex items-center p-2 rounded hover:bg-gray-100"
                @click="$emit('update:open', false)"
              >
                <AcademicCapIcon class="w-5 h-5"/>
                <span class="ml-3 text-sm">Faculty Courses</span>
              </router-link>
              <router-link
                to="/lecturer-schedule"
                class="flex items-center p-2 rounded hover:bg-gray-100"
                @click="$emit('update:open', false)"
              >
                <UserGroupIcon class="w-5 h-5"/>
                <span class="ml-3 text-sm">Lecturers List</span>
              </router-link>
              <router-link
                to="/students-by-section"
                class="flex items-center p-2 rounded hover:bg-gray-100"
                @click="$emit('update:open', false)"
              >
                <UsersIcon class="w-5 h-5"/>
                <span class="ml-3 text-sm">Students List</span>
              </router-link>
              <router-link
                to="/room-availability"
                class="flex items-center p-2 rounded hover:bg-gray-100"
                @click="$emit('update:open', false)"
              >
                <BuildingOfficeIcon class="w-5 h-5"/>
                <span class="ml-3 text-sm">Room Availability</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>

      <!-- Logout -->
      <div class="p-4 border-t">
        <button
          @click="logout"
          class="flex items-center w-full p-2 rounded hover:bg-gray-100 text-red-600"
        >
          <ArrowLeftOnRectangleIcon class="w-6 h-6"/>
          <span class="ml-3">Logout</span>
        </button>
      </div>
    </aside>
  </transition>
</template>

<script>
import { useRouter } from 'vue-router'
import {
  HomeIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  UserGroupIcon,
  UsersIcon,
  BuildingOfficeIcon
} from '@heroicons/vue/24/solid'

export default {
  name: 'Sidebar',
  props: { open: Boolean },
  emits: ['update:open'],
  data() {
    return {
      isMoreOpen: false
    }
  },
  components: {
    HomeIcon, CalendarIcon, UserIcon,
    ChartBarIcon, EllipsisVerticalIcon, XMarkIcon, 
    ArrowLeftOnRectangleIcon, BookOpenIcon, AcademicCapIcon,
    ChevronDownIcon, UserGroupIcon, UsersIcon, BuildingOfficeIcon
  },
  setup(_, { emit }) {
    const router = useRouter()

    function logout() {
      console.log('[Sidebar] Logging out...')
      localStorage.clear()
      emit('update:open', false)
      router.push('/')
    }

    return { logout }
  },
  methods: {
    toggleMore() {
      this.isMoreOpen = !this.isMoreOpen
    }
  }
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
