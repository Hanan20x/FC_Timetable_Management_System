<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-sm bg-white p-8 rounded-xl shadow">
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <img src="@/assets/logo.png" alt="FC Logo" class="h-16 w-16" />
      </div>

      <!-- Title -->
      <h1 class="text-center text-2xl font-bold text-gray-800 mb-8">STAFF/STUDENT</h1>

      <!-- Form -->
      <form @submit.prevent="handleLogin" novalidate>
        <!-- Email Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model.trim="email"
            type="text"
            placeholder="Staff number or Matric"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">
            {{ errors.email }}
          </p>
        </div>

        <!-- Password Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="at least 8 characters"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">
            {{ errors.password }}
          </p>
        </div>

      

        <!-- General Error Message -->
        <p v-if="errors.general" class="mb-4 text-center text-sm text-red-600">
          {{ errors.general }}
        </p>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 mb-4 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
        >
          <span v-if="!loading">SUBMIT</span>
          <span v-else>Loading…</span>
        </button>
      </form>

      <!-- Guest Link -->
      <p class="text-center text-sm text-gray-600">
        Not From FC? <a href="#" class="text-blue-600 hover:underline">GUEST</a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      errors: {
        email: null,
        password: null,
        general: null,
      },
    };
  },
  methods: {
    async handleLogin() {
      // Reset errors
      this.errors = { email: null, password: null, general: null };

      // Client-side validation
      if (!this.email) {
        this.errors.email = "Staff number or Matric is required.";
      }
      if (!this.password) {
        this.errors.password = "Password is required.";
      } else if (this.password.length < 8) {
        this.errors.password = "Password must be at least 8 characters.";
      }
      if (this.errors.email || this.errors.password) {
        return;
      }

      // Build URL
      const baseUrl = "http://web.fc.utm.my/ttms/web_man_webservice_json.cgi";
      const params = new URLSearchParams({
        entity: "authentication",
        login: this.email,
        password: this.password,
      });
      const url = `${baseUrl}?${params.toString()}`;

      this.loading = true;
      try {
        const res = await fetch(url);
        const json = await res.json();

        if (!Array.isArray(json) || json.length === 0) {
          throw new Error("No session returned");
        }

        // Save session exactly as old app did
        localStorage.setItem("web.fc.utm.my_usersession", JSON.stringify(json[0]));
        console.log("Session saved:", json[0]);
        // Redirect to Profile page
        this.$router.push({ name: "Profile" });
      } catch (err) {
        console.error(err);
        this.errors.general = "ERROR LOGGING IN. PLEASE TRY AGAIN!";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* All styling is via Tailwind; no extra CSS needed */
</style>
