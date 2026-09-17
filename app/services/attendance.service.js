const attendanceRepo = require('../repositories/attendance.repo');
const studentRepo = require('../repositories/student.repo');
const rtdbRepo = require('../repositories/rtdb.repo');
const academicService = require('./academic.service');
const auditService = require('./audit.service');
const IdGenerator = require('../utils/idGenerator');
const { AUDIT_ACTION, ATTENDANCE_STATUS } = require('../constants/statuses');

class AttendanceService {
  /**
   * Mark attendance for a class batch
   * Prevents duplicate attendance records for the same student/date/session
   */
  async markClassAttendance(classId, sectionId, date, records, req = null) {
    const session = await academicService.getActiveSession();
    const sessionId = session?.id || 'session_2025_2026';
    const batch = attendanceRepo.batch();

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;
    let halfDayCount = 0;

    const savedRecords = [];

    for (const item of records) {
      const { studentId, status, remarks = '' } = item;

      if (!Object.values(ATTENDANCE_STATUS).includes(status)) {
        throw new Error(`Invalid attendance status '${status}' for student ${studentId}`);
      }

      // Check for existing duplicate attendance record
      const existing = await attendanceRepo.findExistingRecord(studentId, date, sessionId);
      const recordId = existing ? existing.id : IdGenerator.prefixedId('att');

      const payload = {
        id: recordId,
        studentId,
        classId,
        sectionId,
        academicSessionId: sessionId,
        date,
        status,
        remarks,
        markedBy: req?.user?.id || 'SYSTEM',
        updatedAt: new Date().toISOString()
      };

      if (!existing) {
        payload.createdAt = new Date().toISOString();
        payload.isDeleted = false;
      }

      const docRef = attendanceRepo.collection.doc(recordId);
      batch.set(docRef, payload, { merge: true });
      savedRecords.push(payload);

      if (status === ATTENDANCE_STATUS.PRESENT) presentCount++;
      else if (status === ATTENDANCE_STATUS.ABSENT) absentCount++;
      else if (status === ATTENDANCE_STATUS.LATE) lateCount++;
      else if (status === ATTENDANCE_STATUS.EXCUSED) excusedCount++;
      else if (status === ATTENDANCE_STATUS.HALF_DAY) halfDayCount++;
    }

    await batch.commit();

    const stats = {
      totalStudents: records.length,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      halfDayCount,
      attendanceRate: records.length ? Math.round((presentCount / records.length) * 100) : 0
    };

    // Update Realtime Database for live presence & attendance monitoring
    await rtdbRepo.updateLiveAttendance(classId, sectionId, { date, ...stats });

    // Write audit entry
    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'ATTENDANCE',
      entityType: 'ATTENDANCE_BATCH',
      entityId: `${classId}_${sectionId}_${date}`,
      after: { date, classId, sectionId, count: records.length, stats }
    });

    return { success: true, count: savedRecords.length, stats };
  }

  /**
   * Get attendance records for a specific class, section and date
   */
  async getClassAttendance(classId, sectionId, date) {
    const students = await studentRepo.findByClassAndSection(classId, sectionId);
    const records = await attendanceRepo.findByClassSectionAndDate(classId, sectionId, date);
    const recordMap = new Map(records.map(r => [r.studentId, r]));

    return students.map(st => {
      const att = recordMap.get(st.id);
      return {
        studentId: st.id,
        admissionNumber: st.admissionNumber,
        firstName: st.firstName,
        lastName: st.lastName,
        rollNumber: st.rollNumber,
        status: att ? att.status : 'UNMARKED',
        remarks: att ? att.remarks : ''
      };
    });
  }

  /**
   * Calculate student individual attendance percentage and history
   */
  async getStudentAttendanceSummary(studentId, academicSessionId = null) {
    const records = await attendanceRepo.findByStudent(studentId, academicSessionId);
    const totalDays = records.length;

    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let halfDay = 0;

    records.forEach(r => {
      if (r.status === ATTENDANCE_STATUS.PRESENT) present++;
      else if (r.status === ATTENDANCE_STATUS.ABSENT) absent++;
      else if (r.status === ATTENDANCE_STATUS.LATE) late++;
      else if (r.status === ATTENDANCE_STATUS.EXCUSED) excused++;
      else if (r.status === ATTENDANCE_STATUS.HALF_DAY) halfDay++;
    });

    // Count present + halfDay*0.5 + late for overall percentage
    const weightedPresent = present + (halfDay * 0.5) + late;
    const percentage = totalDays > 0 ? ((weightedPresent / totalDays) * 100).toFixed(1) : 100;

    return {
      totalDays,
      present,
      absent,
      late,
      excused,
      halfDay,
      percentage: Number(percentage),
      recentRecords: records.slice(0, 30)
    };
  }
}

module.exports = new AttendanceService();
