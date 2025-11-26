const store = require('../store');

class AdminService {
  getStatistics() {
    return store.getStatistics();
  }
}

module.exports = new AdminService();

