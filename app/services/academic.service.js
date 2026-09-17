const {
  classRepo,
  sectionRepo,
  subjectRepo,
  academicSessionRepo,
  timetableRepo
} = require('../repositories/academic.repo');
const auditService = require('./audit.service');
const { AUDIT_ACTION } = require('../constants/statuses');

class AcademicService {
  // --- Academic Sessions ---
  async getSessions() {
    return academicSessionRepo.find({ orderBy: { field: 'startDate', direction: 'desc' } });
  }

  async getActiveSession() {
    const active = await academicSessionRepo.getActiveSession();
    if (!active) {
      const all = await this.getSessions();
      return all[0] || null;
    }
    return active;
  }

  async createSession(sessionData, req = null) {
    const session = await academicSessionRepo.create(sessionData);
    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'ACADEMIC',
      entityType: 'SESSION',
      entityId: session.id,
      after: session
    });
    return session;
  }

  // --- Classes & Sections ---
  async getClasses() {
    const classes = await classRepo.find({ orderBy: { field: 'name', direction: 'asc' } });
    const sections = await sectionRepo.find();
    return classes.map(cls => ({
      ...cls,
      sections: sections.filter(sec => sec.classId === cls.id)
    }));
  }

  async getClassById(classId) {
    const cls = await classRepo.findById(classId);
    if (!cls) return null;
    const sections = await sectionRepo.findByClassId(classId);
    const subjects = await subjectRepo.findByClassId(classId);
    return { ...cls, sections, subjects };
  }

  async createClass(classData, req = null) {
    const cls = await classRepo.create(classData);
    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'ACADEMIC',
      entityType: 'CLASS',
      entityId: cls.id,
      after: cls
    });
    return cls;
  }

  async createSection(sectionData, req = null) {
    const sec = await sectionRepo.create(sectionData);
    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'ACADEMIC',
      entityType: 'SECTION',
      entityId: sec.id,
      after: sec
    });
    return sec;
  }

  // --- Subjects ---
  async getSubjects(classId = null) {
    if (classId) {
      return subjectRepo.findByClassId(classId);
    }
    return subjectRepo.find();
  }

  async createSubject(subjectData, req = null) {
    const sub = await subjectRepo.create(subjectData);
    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'ACADEMIC',
      entityType: 'SUBJECT',
      entityId: sub.id,
      after: sub
    });
    return sub;
  }

  // --- Timetable & Conflict Detection ---
  async getTimetable(classId, sectionId) {
    return timetableRepo.findByClassAndSection(classId, sectionId);
  }

  async getTeacherTimetable(teacherId) {
    return timetableRepo.findByTeacherId(teacherId);
  }

  async addTimetableSlot(slotData, req = null) {
    // Conflict Check 1: Check if teacher is already booked on same day and time
    if (slotData.teacherId) {
      const teacherSlots = await timetableRepo.findByTeacherId(slotData.teacherId);
      const conflict = teacherSlots.find(s => 
        s.day === slotData.day &&
        s.startTime === slotData.startTime
      );
      if (conflict) {
        throw new Error(`Schedule Conflict: Teacher is already assigned to ${conflict.className || 'another class'} at ${slotData.day} ${slotData.startTime}`);
      }
    }

    // Conflict Check 2: Check if class & section already has a period at this time
    const classSlots = await timetableRepo.findByClassAndSection(slotData.classId, slotData.sectionId);
    const classConflict = classSlots.find(s =>
      s.day === slotData.day &&
      s.startTime === slotData.startTime
    );
    if (classConflict) {
      throw new Error(`Schedule Conflict: This class already has ${classConflict.subjectName} scheduled at ${slotData.day} ${slotData.startTime}`);
    }

    const slot = await timetableRepo.create(slotData);
    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'ACADEMIC',
      entityType: 'TIMETABLE_SLOT',
      entityId: slot.id,
      after: slot
    });
    return slot;
  }
}

module.exports = new AcademicService();
