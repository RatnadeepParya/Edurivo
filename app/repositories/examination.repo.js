const BaseFirestoreRepo = require('./base.firestore.repo');

class ExamRepo extends BaseFirestoreRepo {
  constructor() {
    super('exams');
  }

  async findBySession(academicSessionId) {
    return this.find({
      filters: [{ field: 'academicSessionId', op: '==', value: academicSessionId }]
    });
  }
}

class ResultRepo extends BaseFirestoreRepo {
  constructor() {
    super('results');
  }

  async findByExamAndStudent(examId, studentId) {
    const results = await this.find({
      filters: [
        { field: 'examId', op: '==', value: examId },
        { field: 'studentId', op: '==', value: studentId }
      ]
    });
    return results.length > 0 ? results[0] : null;
  }

  async findByExamAndClass(examId, classId, sectionId) {
    const filters = [
      { field: 'examId', op: '==', value: examId },
      { field: 'classId', op: '==', value: classId }
    ];
    if (sectionId) {
      filters.push({ field: 'sectionId', op: '==', value: sectionId });
    }
    return this.find({ filters });
  }

  async findByStudent(studentId) {
    return this.find({
      filters: [
        { field: 'studentId', op: '==', value: studentId },
        { field: 'isPublished', op: '==', value: true }
      ]
    });
  }
}

class HomeworkRepo extends BaseFirestoreRepo {
  constructor() {
    super('homework');
  }

  async findByClassAndSection(classId, sectionId = null) {
    const filters = [{ field: 'classId', op: '==', value: classId }];
    if (sectionId) {
      filters.push({ field: 'sectionId', op: '==', value: sectionId });
    }
    return this.find({
      filters,
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }
}

class HomeworkSubmissionRepo extends BaseFirestoreRepo {
  constructor() {
    super('homeworkSubmissions');
  }

  async findByStudent(studentId) {
    return this.find({
      filters: [{ field: 'studentId', op: '==', value: studentId }]
    });
  }

  async findByHomework(homeworkId) {
    return this.find({
      filters: [{ field: 'homeworkId', op: '==', value: homeworkId }]
    });
  }
}

module.exports = {
  examRepo: new ExamRepo(),
  resultRepo: new ResultRepo(),
  homeworkRepo: new HomeworkRepo(),
  homeworkSubmissionRepo: new HomeworkSubmissionRepo()
};
