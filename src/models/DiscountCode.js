class DiscountCode {
  constructor(code) {
    this.code = code;
    this.status = 'AVAILABLE';
    this.discountPercent = 10;
    this.createdAt = new Date();
    this.usedAt = null;
  }

  markAsUsed() {
    this.status = 'USED';
    this.usedAt = new Date();
  }

  isAvailable() {
    return this.status === 'AVAILABLE';
  }
}

module.exports = DiscountCode;


