const { examRepo, resultRepo, homeworkRepo, homeworkSubmissionRepo } = require('../repositories/examination.repo');
const studentRepo = require('../repositories/student.repo');
const { classRepo, sectionRepo, subjectRepo } = require('../repositories/academic.repo');
const settingsRepo = require('../repositories/settings.repo');
const auditService = require('./audit.service');
const IdGenerator = require('../utils/idGenerator');
const { AUDIT_ACTION, EXAM_STATUS } = require('../constants/statuses');

class ExaminationService {
  async getExams(sessionId) {
    return examRepo.find({
      filters: sessionId ? [{ field: 'academicSessionId', op: '==', value: sessionId }] : [],
      orderBy: { field: 'startDate', direction: 'desc' }
    });
  }

  async getExamById(id) {
    return examRepo.findById(id);
  }

  async createExam(examData, req = null) {
    const examId = IdGenerator.prefixedId('exm');
    const payload = {
      ...examData,
      status: EXAM_STATUS.SCHEDULED,
      isPublished: false,
      createdAt: new Date().toISOString()
    };
    const created = await examRepo.create(examId, payload);

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'EXAMINATION',
      entityType: 'EXAM',
      entityId: examId,
      after: created
    });

    return created;
  }

  /**
   * Enter / Update Marks for a subject
   */
  async enterMarks(params, req = null) {
    const { examId, classId, sectionId, subjectId, maxMarks, passMarks, marks } = params;

    const exam = await examRepo.findById(examId);
    if (!exam) throw new Error('Exam not found');

    const subject = await subjectRepo.findById(subjectId);
    const subjectName = subject?.name || 'Subject';

    const batch = resultRepo.batch();
    const updatedResults = [];

    for (const item of marks) {
      const { studentId, obtainedMarks, remarks = '' } = item;
      const numObtained = Number(obtainedMarks);

      if (numObtained < 0 || numObtained > Number(maxMarks)) {
        throw new Error(`Marks for student ${studentId} must be between 0 and max marks (${maxMarks}).`);
      }

      // Check if student result record already exists
      let result = await resultRepo.findByExamAndStudent(examId, studentId);

      // Business Rule: If result is published, cannot be silently updated without explicit permission
      if (result && result.isPublished && !req?.user?.permissions?.includes('result.publish')) {
        throw new Error(`Forbidden: Result for this student has already been published and is locked.`);
      }

      const resultId = result ? result.id : IdGenerator.prefixedId('res');
      const existingSubjects = result ? (result.subjects || []) : [];

      // Update or append subject mark
      const subIndex = existingSubjects.findIndex(s => s.subjectId === subjectId);
      const grade = this.calculateGrade(numObtained, Number(maxMarks));

      const subEntry = {
        subjectId,
        subjectName,
        maxMarks: Number(maxMarks),
        passMarks: Number(passMarks),
        obtainedMarks: numObtained,
        grade,
        passed: numObtained >= Number(passMarks),
        remarks
      };

      if (subIndex >= 0) {
        existingSubjects[subIndex] = subEntry;
      } else {
        existingSubjects.push(subEntry);
      }

      // Recalculate totals
      let totalMax = 0;
      let totalObtained = 0;
      let allPassed = true;

      existingSubjects.forEach(s => {
        totalMax += s.maxMarks;
        totalObtained += s.obtainedMarks;
        if (!s.passed) allPassed = false;
      });

      const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
      const overallGrade = this.calculateGrade(percentage, 100);

      const payload = {
        id: resultId,
        examId,
        studentId,
        classId,
        sectionId,
        subjects: existingSubjects,
        totalMax,
        totalObtained,
        percentage,
        overallGrade,
        status: allPassed ? 'PASS' : 'FAIL',
        isPublished: result ? result.isPublished : false,
        updatedAt: new Date().toISOString()
      };

      if (!result) {
        payload.createdAt = new Date().toISOString();
        payload.isDeleted = false;
      }

      const docRef = resultRepo.collection.doc(resultId);
      batch.set(docRef, payload, { merge: true });
      updatedResults.push(payload);
    }

    await batch.commit();

    await auditService.record({
      req,
      action: AUDIT_ACTION.UPDATE,
      module: 'EXAMINATION',
      entityType: 'MARKS_BATCH',
      entityId: `${examId}_${subjectId}`,
      after: { examId, subjectId, count: marks.length }
    });

    return { success: true, count: updatedResults.length };
  }

  /**
   * Publish results for an exam
   */
  async publishResults(examId, req = null) {
    const exam = await examRepo.findById(examId);
    if (!exam) throw new Error('Exam not found');

    const results = await resultRepo.find({
      filters: [{ field: 'examId', op: '==', value: examId }]
    });

    const batch = resultRepo.batch();
    for (const res of results) {
      const docRef = resultRepo.collection.doc(res.id);
      batch.update(docRef, {
        isPublished: true,
        publishedAt: new Date().toISOString(),
        publishedBy: req?.user?.id || 'ADMIN'
      });
    }

    // Mark exam as published
    const examRef = examRepo.collection.doc(examId);
    batch.update(examRef, {
      status: EXAM_STATUS.PUBLISHED,
      isPublished: true,
      publishedAt: new Date().toISOString()
    });

    await batch.commit();

    await auditService.record({
      req,
      action: AUDIT_ACTION.RESULT_PUBLISH,
      module: 'EXAMINATION',
      entityType: 'EXAM',
      entityId: examId,
      after: { isPublished: true, count: results.length }
    });

    return { success: true, count: results.length };
  }

  async getStudentResults(studentId) {
    return resultRepo.findByStudent(studentId);
  }

  calculateGrade(obtained, max) {
    const percentage = max > 0 ? (obtained / max) * 100 : 0;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }

  // --- Homework Management ---
  async createHomework(data, req = null) {
    const hwId = IdGenerator.prefixedId('hw');
    
    // Resolve Class and Subject Names for rich UI display
    let className = 'Class';
    let subjectName = 'Subject';
    if (data.classId) {
      const cls = await classRepo.findById(data.classId);
      if (cls) className = cls.name;
    }
    if (data.subjectId) {
      const sub = await subjectRepo.findById(data.subjectId);
      if (sub) subjectName = sub.name;
    }

    const payload = {
      ...data,
      className,
      subjectName,
      assignedBy: req?.user?.displayName || req?.user?.id || 'Teacher',
      status: 'ASSIGNED',
      createdAt: new Date().toISOString()
    };

    const created = await homeworkRepo.create(hwId, payload);

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'HOMEWORK',
      entityType: 'HOMEWORK',
      entityId: hwId,
      after: created
    });

    return created;
  }

  async getAllHomework() {
    return homeworkRepo.find({ orderBy: { field: 'createdAt', direction: 'desc' } });
  }

  async getHomeworkForClass(classId, sectionId = null) {
    return homeworkRepo.findByClassAndSection(classId, sectionId);
  }

  async submitHomework(homeworkId, studentId, submissionData, req = null) {
    const subId = IdGenerator.prefixedId('sub');
    const submission = {
      id: subId,
      homeworkId,
      studentId,
      notes: submissionData.notes || submissionData.content || '',
      attachmentUrl: submissionData.attachmentUrl || null,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString()
    };

    const created = await homeworkSubmissionRepo.create(subId, submission);

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'HOMEWORK',
      entityType: 'SUBMISSION',
      entityId: subId,
      after: created
    });

    return created;
  }

  async getStudentSubmissions(studentId) {
    return homeworkSubmissionRepo.findByStudent(studentId);
  }
}

module.exports = new ExaminationService();
