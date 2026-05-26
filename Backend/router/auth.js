/**
 * RESTful Web Service — Authentication Router
 *
 * Base URL: /api/auth
 *
 * Endpoints:
 *   POST /api/auth/login   → Login with credentials in JSON body  ⭐ RESTful WS #1
 *   GET  /api/auth/login   → Login with credentials in query params (legacy support)
 *
 * POST /api/auth/login
 *   Body: { "login": "A22EC0XXX", "password": "yourpassword" }
 *   Response 200: { userSession: {...}, adminSession: {...} }
 *   Response 401: { error: "Invalid credentials" }
 *   Response 400: { error: "Login and password are required" }
 *
 * GET /api/auth/login?login=A22EC0XXX&password=yourpassword
 *   Response 200: { userSession: {...}, adminSession: {...} }
 */

const express = require('express');
const router  = express.Router();
const authController = require('../controllers/authController');

// ⭐ RESTful Web Service #1 — POST-based login (RESTful best practice)
// Client sends credentials in the JSON request body (not in the URL)
router.post('/login', authController.login);

// Legacy GET-based login (kept for backward compatibility with existing frontend)
router.get('/login', authController.login);

module.exports = router;