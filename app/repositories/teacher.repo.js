const BaseFirestoreRepo = require('./base.firestore.repo');

class TeacherRepo extends BaseFirestoreRepo {
  constructor() {
    super('teachers');
  }

  async findByEmployeeId(employeeId) {
    const results = await this.find({
      filters: [{ field: 'employeeId', op: '==', value: employeeId }]
    });
    return results.length > 0 ? results[0] : null;
  }

  async findByEmail(email) {
    const results = await this.find({
      filters: [{ field: 'email', op: '==', value: email }]
    });
    return results.length > 0 ? results[0] : null;
  }

  async search(queryText, limit = 20) {
    const all = await this.find({ limit: 100 });
    const q = queryText.toLowerCase();
    return all.filter(t => 
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.employeeId && t.employeeId.toLowerCase().includes(q)) ||
      (t.department && t.department.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q))
    ).slice(0, limit);
  }
}

module.exports = new TeacherRepo();
