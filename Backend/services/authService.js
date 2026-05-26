const axios = require('axios');
const TTMS_API       = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi';
const ADMIN_AUTH_API = 'http://web.fc.utm.my/ttms/auth-admin.php';

module.exports = {
  async authenticateUser(login, password) {
    const { data } = await axios.get(TTMS_API, {
      params: { entity:'authentication', login, password }
    });
    if (!data || data.length===0) throw new Error('Invalid credentials');
    return data[0];
  },

  async fetchAdminSession(sessionId) {
    const { data } = await axios.get(ADMIN_AUTH_API, {
      params: { session_id: sessionId }
    });
    return data[0];
  }
};
