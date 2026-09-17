const BaseFirestoreRepo = require('./base.firestore.repo');
const appConfig = require('../config/app.config');

class SettingsRepo extends BaseFirestoreRepo {
  constructor() {
    super('settings');
    this.DEFAULT_SETTING_ID = 'school_profile';
  }

  async getSchoolSettings() {
    const doc = await this.findById(this.DEFAULT_SETTING_ID);
    if (!doc) {
      // Seed default settings
      const defaults = {
        id: this.DEFAULT_SETTING_ID,
        ...appConfig.school,
        receiptPrefix: appConfig.finance.receiptPrefix,
        invoicePrefix: appConfig.finance.invoicePrefix,
        gradingScale: [
          { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0 },
          { grade: 'A',  minPercentage: 80, maxPercentage: 89.9, gpa: 3.7 },
          { grade: 'B+', minPercentage: 70, maxPercentage: 79.9, gpa: 3.3 },
          { grade: 'B',  minPercentage: 60, maxPercentage: 69.9, gpa: 3.0 },
          { grade: 'C',  minPercentage: 50, maxPercentage: 59.9, gpa: 2.0 },
          { grade: 'D',  minPercentage: 40, maxPercentage: 49.9, gpa: 1.0 },
          { grade: 'F',  minPercentage: 0,  maxPercentage: 39.9, gpa: 0.0 }
        ]
      };
      await this.create(this.DEFAULT_SETTING_ID, defaults);
      return defaults;
    }
    return doc;
  }

  async updateSchoolSettings(data) {
    return this.update(this.DEFAULT_SETTING_ID, data);
  }
}

module.exports = new SettingsRepo();
