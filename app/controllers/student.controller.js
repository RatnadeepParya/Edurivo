const dashboardService = require('../services/dashboard.service');
const studentService = require('../services/student.service');
const attendanceService = require('../services/attendance.service');
const examinationService = require('../services/examination.service');
const financeService = require('../services/finance.service');
const receiptService = require('../services/receipt.service');
const academicService = require('../services/academic.service');

class StudentController {
  async dashboard(req, res, next) {
    try {
      const stats = await dashboardService.getStudentStats(req.user.id);
      res.render('student/dashboard', {
        title: 'Student Portal | Edurivo',
        stats
      });
    } catch (err) {
      next(err);
    }
  }

  async attendance(req, res, next) {
    try {
      const summary = await attendanceService.getStudentAttendanceSummary(req.user.id);
      res.render('student/attendance', {
        title: 'My Attendance History | Edurivo',
        summary
      });
    } catch (err) {
      next(err);
    }
  }

  async results(req, res, next) {
    try {
      const results = await examinationService.getStudentResults(req.user.id);
      res.render('student/results', {
        title: 'Examination Results & Grades | Edurivo',
        results
      });
    } catch (err) {
      next(err);
    }
  }

  async fees(req, res, next) {
    try {
      const feesData = await financeService.getStudentFees(req.user.id);
      const receipts = await receiptService.getStudentReceipts(req.user.id);
      res.render('student/fees', {
        title: 'Fee Status & Payment History | Edurivo',
        fees: feesData.fees,
        summary: feesData.summary,
        receipts
      });
    } catch (err) {
      next(err);
    }
  }

  async timetable(req, res, next) {
    try {
      const student = await studentService.getStudentById(req.user.id);
      const schedule = student?.classId && student?.sectionId 
        ? await academicService.getTimetable(student.classId, student.sectionId)
        : [];

      res.render('student/timetable', {
        title: 'Class Routine & Timetable | Edurivo',
        schedule,
        student
      });
    } catch (err) {
      next(err);
    }
  }

  async homework(req, res, next) {
    try {
      const student = await studentService.getStudentById(req.user.id);
      let homeworkList = [];
      if (student?.classId) {
        homeworkList = await examinationService.getHomeworkForClass(student.classId, student.sectionId);
      }
      const submissions = await examinationService.getStudentSubmissions(req.user.id);
      const submittedIds = new Set(submissions.map(s => s.homeworkId));

      res.render('student/homework', {
        title: 'My Assignments & Homework | Edurivo',
        homeworkList,
        submittedIds,
        submissions,
        student
      });
    } catch (err) {
      next(err);
    }
  }

  async submitHomework(req, res, next) {
    try {
      await examinationService.submitHomework(req.params.id, req.user.id, req.body, req);
      res.redirect('/student/homework?success=submitted');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StudentController();
