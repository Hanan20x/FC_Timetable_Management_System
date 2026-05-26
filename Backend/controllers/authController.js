/**
 * Auth Controller — Handles user authentication
 *
 * Supports both:
 *   - POST /api/auth/login  → credentials from req.body (RESTful standard)
 *   - GET  /api/auth/login  → credentials from req.query (legacy)
 */

const authSvc = require('../services/authService');

module.exports = {
  /**
   * Login handler — works for both GET (query params) and POST (JSON body)
   *
   * POST body:  { "login": "A22EC0XXX", "password": "secret" }
   * GET query:  ?login=A22EC0XXX&password=secret
   *
   * Response 200: { userSession: { ... }, adminSession: { ... } }
   * Response 400: { error: "Login and password are required" }
   * Response 401: { error: "Invalid credentials" }
   * Response 500: { error: "..." }
   */
  login: async (req, res) => {
    try {
      // Support both POST body and GET query parameters
      const login    = req.body?.login    || req.query?.login;
      const password = req.body?.password || req.query?.password;

      if (!login || !password) {
        return res.status(400).json({ error: 'Login and password are required' });
      }

      const userSession  = await authSvc.authenticateUser(login, password);
      const adminSession = await authSvc.fetchAdminSession(userSession.session_id);

      res.json({ userSession, adminSession });
    } catch (e) {
      console.error('[AuthController] Login error:', e.message);
      const code = e.message === 'Invalid credentials' ? 401 : 500;
      res.status(code).json({ error: e.message });
    }
  }
};
