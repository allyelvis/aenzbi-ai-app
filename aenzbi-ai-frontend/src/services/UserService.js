import axios from 'axios';

const API_URL = 'http://localhost:5000/api/user';

class UserService {
  getUserProfile() {
    return axios.get(`${API_URL}/profile`, { headers: this.authHeader() });
  }

  authHeader() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      return { Authorization: 'Bearer ' + user.token };
    } else {
      return {};
    }
  }
}

export default new UserService();
