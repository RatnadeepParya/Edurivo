const BaseFirestoreRepo = require('./base.firestore.repo');

class StudentRepo extends BaseFirestoreRepo {
  constructor() {
    super('students');
  }

  async findByAdmissionNumber(admissionNumber) {
    const results = await this.find({
      filters: [{ field: 'admissionNumber', op: '==', value: admissionNumber }]
    });
    return results.length > 0 ? results[0] : null;
  }

  async findByClassAndSection(classId, sectionId) {
    const filters = [{ field: 'classId', op: '==', value: classId }];
    if (sectionId) {
      filters.push({ field: 'sectionId', op: '==', value: sectionId });
    }
    return this.find({
      filters,
      orderBy: { field: 'rollNumber', direction: 'asc' }
    });
  }

  async search(queryText, limit = 20) {
    const all = await this.find({ limit: 100 });
    const q = queryText.toLowerCase();
    return all.filter(s => 
      (s.firstName && s.firstName.toLowerCase().includes(q)) ||
      (s.lastName && s.lastName.toLowerCase().includes(q)) ||
      (s.admissionNumber && s.admissionNumber.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q))
    ).slice(0, limit);
  }
}

module.exports = new StudentRepo();
