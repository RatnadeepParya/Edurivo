const dashboardService = require('../services/dashboard.service');
const studentService = require('../services/student.service');
const hrService = require('../services/hr.service');
const academicService = require('../services/academic.service');
const attendanceService = require('../services/attendance.service');
const financeService = require('../services/finance.service');
const examinationService = require('../services/examination.service');
const expenseService = require('../services/expense.service');
const libraryService = require('../services/library.service');
const inventoryService = require('../services/inventory.service');
const noticeService = require('../services/notice.service');
const reportService = require('../services/report.service');
const auditService = require('../services/audit.service');
const transportService = require('../services/transport.service');
const settingsRepo = require('../repositories/settings.repo');
const { getTodayString } = require('../utils/dateUtils');
const logger = require('../config/logger');

class AdminController {
  // --- Dashboard ---
  async dashboard(req, res, next) {
    try {
      const stats = await dashboardService.getAdminStats();
      const schoolSettings = await settingsRepo.getSchoolSettings();
      res.render('admin/dashboard', {
        title: 'Admin Dashboard | Edurivo',
        stats,
        school: schoolSettings
      });
    } catch (err) {
      next(err);
    }
  }

  // --- Students ---
  async studentsList(req, res, next) {
    try {
      const { classId, sectionId, q } = req.query;
      const students = await studentService.getStudents({ classId, sectionId, query: q });
      const classes = await academicService.getClasses();
      res.render('admin/students/index', {
        title: 'Student Directory | Edurivo',
        students,
        classes,
        selectedClass: classId,
        selectedSection: sectionId,
        searchQuery: q || ''
      });
    } catch (err) {
      next(err);
    }
  }

  async studentForm(req, res, next) {
    try {
      const classes = await academicService.getClasses();
      res.render('admin/students/form', {
        title: 'Admit New Student | Edurivo',
        classes,
        student: null
      });
    } catch (err) {
      next(err);
    }
  }

  async createStudent(req, res, next) {
    try {
      const student = await studentService.createStudent(req.body, req);
      res.redirect(`/admin/students/${student.id}?success=admitted`);
    } catch (err) {
      next(err);
    }
  }

  async viewStudent(req, res, next) {
    try {
      const student = await studentService.getStudentById(req.params.id);
      if (!student) {
        return res.status(404).render('errors/404', { title: 'Student Not Found', url: req.originalUrl });
      }
      const fees = await financeService.getStudentFees(student.id);
      const attendance = await attendanceService.getStudentAttendanceSummary(student.id);
      const results = await examinationService.getStudentResults(student.id);

      res.render('admin/students/view', {
        title: `${student.firstName} ${student.lastName} | Student Profile`,
        student,
        fees,
        attendance,
        results
      });
    } catch (err) {
      next(err);
    }
  }

  // --- Teachers ---
  async teachersList(req, res, next) {
    try {
      const teachers = await hrService.getTeachers();
      res.render('admin/teachers/index', {
        title: 'Teacher Directory | Edurivo',
        teachers
      });
    } catch (err) {
      next(err);
    }
  }

  async createTeacher(req, res, next) {
    try {
      await hrService.createTeacher(req.body, req);
      res.redirect('/admin/teachers?success=created');
    } catch (err) {
      next(err);
    }
  }

  // --- Classes & Academics ---
  async classesList(req, res, next) {
    try {
      const classes = await academicService.getClasses();
      const sessions = await academicService.getSessions();
      res.render('admin/classes/index', {
        title: 'Class & Academic Management | Edurivo',
        classes,
        sessions
      });
    } catch (err) {
      next(err);
    }
  }

  async createClass(req, res, next) {
    try {
      await academicService.createClass(req.body, req);
      res.redirect('/admin/classes?success=class_created');
    } catch (err) {
      next(err);
    }
  }

  async createSection(req, res, next) {
    try {
      await academicService.createSection(req.body, req);
      res.redirect('/admin/classes?success=section_created');
    } catch (err) {
      next(err);
    }
  }

  async createSubject(req, res, next) {
    try {
      await academicService.createSubject(req.body, req);
      res.redirect('/admin/classes?success=subject_created');
    } catch (err) {
      next(err);
    }
  }

  // --- Attendance ---
  async attendanceView(req, res, next) {
    try {
      const { classId, sectionId, date = getTodayString() } = req.query;
      const classes = await academicService.getClasses();
      let attendanceGrid = [];

      if (classId && sectionId) {
        attendanceGrid = await attendanceService.getClassAttendance(classId, sectionId, date);
      }

      res.render('admin/attendance/index', {
        title: 'Attendance Management | Edurivo',
        classes,
        selectedClass: classId,
        selectedSection: sectionId,
        selectedDate: date,
        attendanceGrid
      });
    } catch (err) {
      next(err);
    }
  }

  async saveAttendance(req, res, next) {
    try {
      const { classId, sectionId, date, records } = req.body;
      await attendanceService.markClassAttendance(classId, sectionId, date, records, req);
      res.json({ success: true, message: 'Attendance recorded successfully' });
    } catch (err) {
      res.status(400).json({ success: false, error: { message: err.message } });
    }
  }

  // --- Fees & Finance ---
  async feesList(req, res, next) {
    try {
      const feeStructures = await financeService.getFeeStructures();
      const classes = await academicService.getClasses();
      const outstandingReport = await reportService.getOutstandingFeesReport();

      res.render('admin/fees/index', {
        title: 'Fee Management & Structures | Edurivo',
        feeStructures,
        classes,
        outstandingReport
      });
    } catch (err) {
      next(err);
    }
  }

  async createFeeStructure(req, res, next) {
    try {
      await financeService.createFeeStructure(req.body, req);
      res.redirect('/admin/fees?success=fee_structure_created');
    } catch (err) {
      next(err);
    }
  }

  async assignFeeToClass(req, res, next) {
    try {
      const { feeStructureId, classId } = req.body;
      const result = await financeService.assignFeeToClass(feeStructureId, classId, req);
      res.redirect(`/admin/fees?success=fee_assigned&count=${result.count}`);
    } catch (err) {
      next(err);
    }
  }

  // --- Examinations & Results ---
  async examsList(req, res, next) {
    try {
      const exams = await examinationService.getExams();
      const classes = await academicService.getClasses();
      res.render('admin/exams/index', {
        title: 'Examination System | Edurivo',
        exams,
        classes
      });
    } catch (err) {
      next(err);
    }
  }

  async createExam(req, res, next) {
    try {
      await examinationService.createExam(req.body, req);
      res.redirect('/admin/exams?success=exam_created');
    } catch (err) {
      next(err);
    }
  }

  async publishResults(req, res, next) {
    try {
      const { examId } = req.params;
      await examinationService.publishResults(examId, req);
      res.redirect('/admin/exams?success=results_published');
    } catch (err) {
      next(err);
    }
  }

  // --- Expenses ---
  async expensesList(req, res, next) {
    try {
      const expenses = await expenseService.getExpenses();
      const summary = await expenseService.getExpenseSummary();
      res.render('admin/expenses/index', {
        title: 'Expenses & Procurement | Edurivo',
        expenses,
        summary
      });
    } catch (err) {
      next(err);
    }
  }

  async createExpense(req, res, next) {
    try {
      await expenseService.createExpense(req.body, req);
      res.redirect('/admin/expenses?success=expense_added');
    } catch (err) {
      next(err);
    }
  }

  // --- HR & Payroll ---
  async payrollView(req, res, next) {
    try {
      const monthYear = req.query.monthYear || new Date().toISOString().substring(0, 7);
      const payrollSlips = await hrService.getPayrollForMonth(monthYear);
      const teachers = await hrService.getTeachers();

      res.render('admin/payroll/index', {
        title: 'Payroll & Compensation | Edurivo',
        monthYear,
        payrollSlips,
        teachers
      });
    } catch (err) {
      next(err);
    }
  }

  // --- Leave Management ---
  async leaveView(req, res, next) {
    try {
      const leaves = await hrService.getLeaveRequests();
      res.render('admin/leave/index', {
        title: 'Leave Applications | Edurivo',
        leaves
      });
    } catch (err) {
      next(err);
    }
  }

  async reviewLeave(req, res, next) {
    try {
      const { leaveId, status, reviewNotes } = req.body;
      await hrService.reviewLeave(leaveId, status, reviewNotes, req);
      res.redirect('/admin/leave?success=leave_reviewed');
    } catch (err) {
      next(err);
    }
  }

  // --- Library ---
  async libraryView(req, res, next) {
    try {
      const books = await libraryService.getBooks();
      const activeIssues = await libraryService.getActiveIssues();
      res.render('admin/library/index', {
        title: 'Library System | Edurivo',
        books,
        activeIssues
      });
    } catch (err) {
      next(err);
    }
  }

  async addBook(req, res, next) {
    try {
      await libraryService.addBook(req.body, req);
      res.redirect('/admin/library?success=book_added');
    } catch (err) {
      next(err);
    }
  }

  // --- Inventory ---
  async inventoryView(req, res, next) {
    try {
      const items = await inventoryService.getItems();
      const movements = await inventoryService.getMovements();
      const lowStock = await inventoryService.getLowStockAlerts();
      res.render('admin/inventory/index', {
        title: 'Inventory & Asset Ledger | Edurivo',
        items,
        movements,
        lowStock
      });
    } catch (err) {
      next(err);
    }
  }

  async addInventoryItem(req, res, next) {
    try {
      await inventoryService.addItem(req.body, req);
      res.redirect('/admin/inventory?success=item_added');
    } catch (err) {
      next(err);
    }
  }

  async recordStockMovement(req, res, next) {
    try {
      await inventoryService.recordMovement(req.body, req);
      res.redirect('/admin/inventory?success=movement_recorded');
    } catch (err) {
      next(err);
    }
  }

  // --- Notices & Events ---
  async noticesView(req, res, next) {
    try {
      const notices = await noticeService.getNotices();
      const events = await noticeService.getUpcomingEvents();
      const classes = await academicService.getClasses();
      res.render('admin/notices/index', {
        title: 'Notices & Circulars | Edurivo',
        notices,
        events,
        classes
      });
    } catch (err) {
      next(err);
    }
  }

  async createNotice(req, res, next) {
    try {
      await noticeService.createNotice(req.body, req);
      res.redirect('/admin/notices?success=notice_published');
    } catch (err) {
      next(err);
    }
  }

  // --- Reports ---
  async reportsView(req, res, next) {
    try {
      const today = getTodayString();
      const collectionReport = await reportService.getCollectionReport(today, today);
      const outstandingReport = await reportService.getOutstandingFeesReport();
      res.render('admin/reports/index', {
        title: 'Executive Reports & Analytics | Edurivo',
        collectionReport,
        outstandingReport
      });
    } catch (err) {
      next(err);
    }
  }

  // --- Settings ---
  async settingsView(req, res, next) {
    try {
      const settings = await settingsRepo.getSchoolSettings();
      res.render('admin/settings/index', {
        title: 'School Configuration & Preferences | Edurivo',
        settings
      });
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req, res, next) {
    try {
      await settingsRepo.updateSchoolSettings(req.body);
      res.redirect('/admin/settings?success=settings_updated');
    } catch (err) {
      next(err);
    }
  }

  // --- Audit Logs ---
  async auditView(req, res, next) {
    try {
      const logs = await auditService.getRecentLogs(100);
      res.render('admin/audit/index', {
        title: 'Security & Financial Audit Trail | Edurivo',
        logs
      });
    } catch (err) {
      next(err);
    }
  }

  // --- Transport & Fleet Management ---
  async transportView(req, res, next) {
    try {
      const routes = await transportService.getRoutes();
      res.render('admin/transport/index', {
        title: 'Transport & Fleet Management | Edurivo',
        routes
      });
    } catch (err) {
      next(err);
    }
  }

  async createTransportRoute(req, res, next) {
    try {
      await transportService.createRoute(req.body, req);
      res.redirect('/admin/transport?success=route_created');
    } catch (err) {
      next(err);
    }
  }

  // --- Student ID Card & Badge ---
  async studentIdCard(req, res, next) {
    try {
      const student = await studentService.getStudentById(req.params.id);
      if (!student) {
        return res.status(404).render('errors/404', { title: 'Student Not Found', url: req.originalUrl });
      }
      const school = await settingsRepo.getSchoolSettings();
      res.render('admin/students/idcard', {
        title: `Student ID - ${student.firstName} ${student.lastName} | Edurivo`,
        student,
        school
      });
    } catch (err) {
      next(err);
    }
  }

  // --- CSV Exports ---
  async exportStudentsCsv(req, res, next) {
    try {
      const students = await studentService.getStudents();
      const headers = ['Admission #', 'First Name', 'Last Name', 'Class', 'Section', 'Roll #', 'Gender', 'DOB', 'Email', 'Phone', 'Guardian Name', 'Guardian Phone', 'Status'];
      
      const rows = students.map(s => [
        `"${s.admissionNumber || ''}"`,
        `"${s.firstName || ''}"`,
        `"${s.lastName || ''}"`,
        `"${s.className || ''}"`,
        `"${s.sectionName || ''}"`,
        `"${s.rollNumber || ''}"`,
        `"${s.gender || ''}"`,
        `"${s.dateOfBirth || ''}"`,
        `"${s.email || ''}"`,
        `"${s.phone || ''}"`,
        `"${s.parentName || ''}"`,
        `"${s.parentPhone || ''}"`,
        `"${s.status || 'ACTIVE'}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="edurivo_students_directory.csv"');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  async exportCollectionCsv(req, res, next) {
    try {
      const today = getTodayString();
      const report = await reportService.getCollectionReport(today, today);
      const headers = ['Receipt #', 'Student ID', 'Amount', 'Payment Method', 'Date', 'Cashier ID'];
      
      const rows = (report.receipts || []).map(r => [
        `"${r.receiptNumber || ''}"`,
        `"${r.studentId || ''}"`,
        `"${(r.amountPaid || 0).toFixed(2)}"`,
        `"${r.paymentMethod || ''}"`,
        `"${r.createdAt || ''}"`,
        `"${r.cashierId || ''}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="edurivo_collections_${today}.csv"`);
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  async exportOutstandingCsv(req, res, next) {
    try {
      const today = getTodayString();
      const report = await reportService.getOutstandingFeesReport();
      const headers = ['Fee ID', 'Student ID', 'Title', 'Total Amount', 'Paid Amount', 'Balance Due', 'Due Date', 'Status'];

      const rows = (report.outstandingFees || []).map(f => [
        `"${f.id || ''}"`,
        `"${f.studentId || ''}"`,
        `"${f.title || ''}"`,
        `"${(f.totalAmount || 0).toFixed(2)}"`,
        `"${(f.paidAmount || 0).toFixed(2)}"`,
        `"${(f.balance || 0).toFixed(2)}"`,
        `"${f.dueDate || ''}"`,
        `"${f.status || ''}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="edurivo_outstanding_dues_${today}.csv"`);
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
