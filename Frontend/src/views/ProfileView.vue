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
          <h1 class="text-xl font-bold">Profile</h1>
          <div class="h-8 w-8 rounded-full overflow-hidden">
            <img src="@/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full"/>
          </div>
        </header>
  
        <!-- Profile Content -->
        <main class="p-4">
          <!-- Avatar & Name -->
          <div class="flex flex-col items-center mb-6">
            <div class="h-24 w-24 rounded-full overflow-hidden shadow-md mb-4">
              <img src="@/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full"/>
            </div>
            <h2 class="text-lg font-semibold">{{ user.full_name }}</h2>
            <p class="text-sm text-gray-500">@{{ user.login_name }}</p>
            <p class="text-sm text-gray-600">{{ user.description }}</p>
          </div>
  
          <!-- Key Info Row -->
          <div class="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-6">
  <div class="flex-1 bg-white p-4 rounded-lg shadow">
    <p class="text-xs text-gray-500">Matric No.</p>
    <p class="font-medium text-sm">{{ user.login_name }}</p>
  </div>
  <div class="flex-1 bg-white p-4 rounded-lg shadow">
    <p class="text-xs text-gray-500">Role / Description</p>
    <p class="font-medium text-sm">{{ user.description }}</p>
  </div>
</div>
  
          <!-- Contact Section -->
          <section>
            <h3 class="text-md font-semibold mb-2">Contact</h3>
            <div class="bg-white p-4 rounded-lg shadow space-y-2">
              <div><span class="font-medium">Email:</span> {{ user.email }}</div>
            </div>
          </section>
        </main>
      </div>
    </div>
  </template>
  
  <script>
  import Sidebar from '@/components/Sidebar.vue'
  
  export default {
    name: 'ProfileView',
    components: { Sidebar },
    data() {
      return {
        sidebarOpen: false,
        user: {
          avatar: '@/assets/user-avatar.jpg', // default avatar
          full_name: '',
          login_name: '',
          description: '',
          session_id: '',
          email: '',
        }
      }
    },
    mounted() {
      // Load user session from localStorage
      const session = localStorage.getItem('web.fc.utm.my_usersession');
      if (session) {
        const userData = JSON.parse(session);
        this.user.full_name = userData.full_name || '';
        this.user.login_name = userData.login_name || '';
        this.user.description = userData.description || '';
        this.user.session_id = userData.session_id || '';
        this.user.email = userData.email || '';
        this.user.avatar = '@/assets/user-avatar.jpg'; // default avatar 
      } else {
        console.error('No user session found! Redirecting to login.');
        this.$router.push({ name: 'Login' });
      }
    }
  }
  </script>
  
  <style scoped>
  /* Nothing needed, Tailwind handles everything */
  </style>
  