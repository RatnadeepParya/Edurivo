const { v4: uuidv4 } = require('uuid');

/**
 * Enterprise ID Generator with sequential formatting
 */
class IdGenerator {
  /**
   * Generates a formatted admission number, e.g. ADM-2025-0042
   */
  static generateAdmissionNumber(prefix = 'ADM', year = new Date().getFullYear(), sequence = 1) {
    const padded = String(sequence).padStart(4, '0');
    return `${prefix}-${year}-${padded}`;
  }

  /**
   * Generates a formatted employee ID, e.g. EMP-2025-0012
   */
  static generateEmployeeId(prefix = 'EMP', year = new Date().getFullYear(), sequence = 1) {
    const padded = String(sequence).padStart(4, '0');
    return `${prefix}-${year}-${padded}`;
  }

  /**
   * Generates a formatted receipt number, e.g. REC-2025-000123
   */
  static generateReceiptNumber(prefix = 'REC', year = new Date().getFullYear(), sequence = 1) {
    const padded = String(sequence).padStart(6, '0');
    return `${prefix}-${year}-${padded}`;
  }

  /**
   * Generates a unique UUID v4
   */
  static uuid() {
    return uuidv4();
  }

  /**
   * Generates a prefixed ID, e.g. stu_48df892
   */
  static prefixedId(prefix) {
    return `${prefix}_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
  }
}

module.exports = IdGenerator;
