const BaseFirestoreRepo = require('./base.firestore.repo');

class ClassRepo extends BaseFirestoreRepo {
  constructor() {
    super('classes');
  }
}

class SectionRepo extends BaseFirestoreRepo {
  constructor() {
    super('sections');
  }

  async findByClassId(classId) {
    return this.find({
      filters: [{ field: 'classId', op: '==', value: classId }],
      orderBy: { field: 'name', direction: 'asc' }
    });
  }
}

class SubjectRepo extends BaseFirestoreRepo {
  constructor() {
    super('subjects');
  }

  async findByClassId(classId) {
    return this.find({
      filters: [{ field: 'classId', op: '==', value: classId }]
    });
  }
}

class AcademicSessionRepo extends BaseFirestoreRepo {
  constructor() {
    super('academicSessions');
  }

  async getActiveSession() {
    const results = await this.find({
      filters: [{ field: 'isActive', op: '==', value: true }]
    });
    return results.length > 0 ? results[0] : null;
  }
}

class TimetableRepo extends BaseFirestoreRepo {
  constructor() {
    super('timetable');
  }

  async findByClassAndSection(classId, sectionId) {
    return this.find({
      filters: [
        { field: 'classId', op: '==', value: classId },
        { field: 'sectionId', op: '==', value: sectionId }
      ]
    });
  }

  async findByTeacherId(teacherId) {
    return this.find({
      filters: [{ field: 'teacherId', op: '==', value: teacherId }]
    });
  }
}

module.exports = {
  classRepo: new ClassRepo(),
  sectionRepo: new SectionRepo(),
  subjectRepo: new SubjectRepo(),
  academicSessionRepo: new AcademicSessionRepo(),
  timetableRepo: new TimetableRepo()
};
