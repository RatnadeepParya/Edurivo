const dashboardService = require('../services/dashboard.service');
const academicService = require('../services/academic.service');
const attendanceService = require('../services/attendance.service');
const examinationService = require('../services/examination.service');
const hrService = require('../services/hr.service');
const studentService = require('../services/student.service');
const { getTodayString } = require('../utils/dateUtils');

class TeacherController {
  async dashboard(req, res, next) {
    try {
      const stats = await dashboardService.getTeacherStats(req.user.id);
      const classes = await academicService.getClasses();
      res.render('teacher/dashboard', {
        title: 'Teacher Dashboard | Edurivo',
        stats,
        classes
      });
    } catch (err) {
      next(err);
    }
  }

  async attendanceView(req, res, next) {
    try {
      const { classId, sectionId, date = getTodayString() } = req.query;
      const classes = await academicService.getClasses();
      let attendanceGrid = [];

      if (classId && sectionId) {
        attendanceGrid = await attendanceService.getClassAttendance(classId, sectionId, date);
      }

      res.render('teacher/attendance', {
        title: 'Mark Class Attendance | Edurivo',
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

  async marksView(req, res, next) {
    try {
      const exams = await examinationService.getExams();
      const classes = await academicService.getClasses();
      const subjects = await academicService.getSubjects();

      res.render('teacher/marks', {
        title: 'Enter Student Marks | Edurivo',
        exams,
        classes,
        subjects
      });
    } catch (err) {
      next(err);
    }
  }

  async homeworkView(req, res, next) {
    try {
      const classes = await academicService.getClasses();
      const subjects = await academicService.getSubjects();
      const assignments = await examinationService.getAllHomework();
      res.render('teacher/homework', {
        title: 'Assignments & Homework | Edurivo',
        classes,
        subjects,
        assignments
      });
    } catch (err) {
      next(err);
    }
  }

  async createHomework(req, res, next) {
    try {
      await examinationService.createHomework(req.body, req);
      res.redirect('/teacher/homework?success=assigned');
    } catch (err) {
      next(err);
    }
  }

  async timetable(req, res, next) {
    try {
      const schedule = await academicService.getTeacherTimetable(req.user.id);
      res.render('teacher/timetable', {
        title: 'My Teaching Schedule | Edurivo',
        schedule
      });
    } catch (err) {
      next(err);
    }
  }

  async leaveView(req, res, next) {
    try {
      const leaves = await hrService.getLeaveRequests(req.user.id);
      res.render('teacher/leave', {
        title: 'Apply for Leave | Edurivo',
        leaves
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TeacherController();
