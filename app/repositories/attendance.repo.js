const BaseFirestoreRepo = require('./base.firestore.repo');

class AttendanceRepo extends BaseFirestoreRepo {
  constructor() {
    super('attendance');
  }

  async findExistingRecord(studentId, date, academicSessionId) {
    const filters = [
      { field: 'studentId', op: '==', value: studentId },
      { field: 'date', op: '==', value: date }
    ];
    if (academicSessionId) {
      filters.push({ field: 'academicSessionId', op: '==', value: academicSessionId });
    }
    const results = await this.find({ filters });
    return results.length > 0 ? results[0] : null;
  }

  async findByClassSectionAndDate(classId, sectionId, date) {
    return this.find({
      filters: [
        { field: 'classId', op: '==', value: classId },
        { field: 'sectionId', op: '==', value: sectionId },
        { field: 'date', op: '==', value: date }
      ]
    });
  }

  async findByStudent(studentId, academicSessionId) {
    const filters = [{ field: 'studentId', op: '==', value: studentId }];
    if (academicSessionId) {
      filters.push({ field: 'academicSessionId', op: '==', value: academicSessionId });
    }
    return this.find({
      filters,
      orderBy: { field: 'date', direction: 'desc' }
    });
  }
}

module.exports = new AttendanceRepo();
