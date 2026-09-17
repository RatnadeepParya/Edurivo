const examinationService = require('../../app/services/examination.service');

describe('Examination Grading & Evaluation Engine', () => {
  test('Assigns correct grade based on percentage score', () => {
    expect(examinationService.calculateGrade(95, 100)).toBe('A+');
    expect(examinationService.calculateGrade(82, 100)).toBe('A');
    expect(examinationService.calculateGrade(74, 100)).toBe('B+');
    expect(examinationService.calculateGrade(65, 100)).toBe('B');
    expect(examinationService.calculateGrade(52, 100)).toBe('C');
    expect(examinationService.calculateGrade(44, 100)).toBe('D');
    expect(examinationService.calculateGrade(32, 100)).toBe('F');
  });

  test('Handles proportional scaling when max marks is not 100', () => {
    // 45 / 50 is 90% -> A+
    expect(examinationService.calculateGrade(45, 50)).toBe('A+');
    // 35 / 50 is 70% -> B+
    expect(examinationService.calculateGrade(35, 50)).toBe('B+');
    // 15 / 50 is 30% -> F
    expect(examinationService.calculateGrade(15, 50)).toBe('F');
  });
});
