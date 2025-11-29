const store = require('../store');

class AdminService {
  getStatistics() {
    return store.getStatistics();
  }

  updateNthOrder(newNthOrder) {
    if (newNthOrder < 1 || !Number.isInteger(newNthOrder)) {
      throw new Error('nthOrder must be a positive integer');
    }

    const previousValue = store.nthOrder;
    store.nthOrder = newNthOrder;

    return {
      previousValue,
      newValue: newNthOrder
    };
  }

  getNthOrder() {
    return store.nthOrder;
  }
}

module.exports = new AdminService();


