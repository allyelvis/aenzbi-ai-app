import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

class AuthService {
  async register(username, email, password) {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      email,
      password
    });
    return response.data;
  }

  async login(email, password) {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
}

export default new AuthService();
