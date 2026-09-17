const studentRepo = require('../repositories/student.repo');
const teacherRepo = require('../repositories/teacher.repo');
const attendanceRepo = require('../repositories/attendance.repo');
const { feeRepo, paymentRepo, expenseRepo } = require('../repositories/finance.repo');
const { examRepo, resultRepo, homeworkRepo } = require('../repositories/examination.repo');
const { noticeRepo, eventRepo } = require('../repositories/communication.repo');
const auditService = require('./audit.service');
const cashierService = require('./cashier.service');
const attendanceService = require('./attendance.service');
const { ATTENDANCE_STATUS } = require('../constants/statuses');

class DashboardService {
  async getAdminStats() {
    const today = new Date().toISOString().split('T')[0];

    const [
      studentCount,
      teacherCount,
      todayAttendance,
      cashierDailyStats,
      allFees,
      expenses,
      upcomingExams,
      upcomingEvents,
      recentAudit
    ] = await Promise.all([
      studentRepo.count(),
      teacherRepo.count(),
      attendanceRepo.find({ filters: [{ field: 'date', op: '==', value: today }] }),
      cashierService.getDailyStats(),
      feeRepo.find(),
      expenseRepo.find(),
      examRepo.find({ limit: 5, orderBy: { field: 'startDate', direction: 'asc' } }),
      eventRepo.getUpcomingEvents(),
      auditService.getRecentLogs(10)
    ]);

    // Attendance stats today
    let presentToday = 0;
    todayAttendance.forEach(a => {
      if (a.status === ATTENDANCE_STATUS.PRESENT) presentToday++;
    });
    const attendanceRate = studentCount > 0 && todayAttendance.length > 0 
      ? Math.round((presentToday / todayAttendance.length) * 100) 
      : 0;

    // Fee pending calculation
    let totalAssignedFees = 0;
    let totalCollectedFees = 0;
    let pendingFees = 0;

    allFees.forEach(f => {
      totalAssignedFees += Number(f.totalAmount || 0);
      totalCollectedFees += Number(f.paidAmount || 0);
      pendingFees += Number(f.balance || 0);
    });

    // Total expenses
    let totalExpenses = 0;
    expenses.forEach(e => {
      totalExpenses += Number(e.amount || 0);
    });

    return {
      studentCount,
      teacherCount,
      todayAttendanceCount: todayAttendance.length,
      presentToday,
      attendanceRate,
      todayCollection: cashierDailyStats.totalCollection,
      totalCollectedFees: Number(totalCollectedFees.toFixed(2)),
      pendingFees: Number(pendingFees.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      upcomingExams,
      upcomingEvents,
      recentAudit
    };
  }

  async getTeacherStats(teacherId) {
    const teacher = await teacherRepo.findById(teacherId);
    const notices = await noticeRepo.findForAudience('TEACHERS');
    const upcomingExams = await examRepo.find({ limit: 5, orderBy: { field: 'startDate', direction: 'asc' } });
    
    return {
      teacher,
      assignedClasses: teacher?.assignedClasses || [],
      subjects: teacher?.subjects || [],
      notices: notices.slice(0, 5),
      upcomingExams
    };
  }

  async getStudentStats(studentId) {
    const student = await studentRepo.findById(studentId);
    const attendanceSummary = await attendanceService.getStudentAttendanceSummary(studentId);
    const results = await resultRepo.findByStudent(studentId);
    const fees = await feeRepo.findByStudent(studentId);
    const notices = await noticeRepo.findForAudience('STUDENTS', student?.classId);

    let totalPendingFee = 0;
    fees.forEach(f => {
      totalPendingFee += Number(f.balance || 0);
    });

    return {
      student,
      attendanceSummary,
      results,
      fees,
      totalPendingFee: Number(totalPendingFee.toFixed(2)),
      notices: notices.slice(0, 5)
    };
  }

  async getCashierStats(cashierId) {
    const dailyStats = await cashierService.getDailyStats(cashierId);
    const activeSession = await cashierService.getActiveSession(cashierId);

    const allFees = await feeRepo.find();
    let totalPendingAmount = 0;
    allFees.forEach(f => {
      totalPendingAmount += Number(f.balance || 0);
    });

    return {
      ...dailyStats,
      activeSession,
      totalPendingAmount: Number(totalPendingAmount.toFixed(2))
    };
  }
}

module.exports = new DashboardService();
