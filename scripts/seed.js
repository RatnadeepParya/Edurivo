require('dotenv').config();
const bcrypt = require('bcryptjs');
const { firestore } = require('../app/config/firebase');
const { ROLES } = require('../app/constants/roles');
const { ROLE_PERMISSIONS } = require('../app/constants/permissions');
const logger = require('../app/config/logger');

async function seed() {
  logger.info('Starting Edurivo Enterprise Database Seeding...');

  const now = new Date().toISOString();

  // 1. School Settings
  logger.info('1. Seeding School Profile & Settings...');
  await firestore.collection('settings').doc('school_profile').set({
    id: 'school_profile',
    name: 'Edurivo International Academy',
    tagline: 'Excellence in Global Learning & Character',
    email: 'admissions@edurivo.edu',
    phone: '+1 (555) 348-7486',
    address: '100 Knowledge Boulevard, Academic Park, Metropolis',
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    currentSessionId: 'session_2025_2026',
    currentSessionName: '2025-2026',
    receiptPrefix: 'REC',
    invoicePrefix: 'INV',
    updatedAt: now
  });

  // 2. Academic Session
  logger.info('2. Seeding Academic Session...');
  await firestore.collection('academicSessions').doc('session_2025_2026').set({
    id: 'session_2025_2026',
    name: '2025-2026',
    startDate: '2025-08-01',
    endDate: '2026-06-30',
    isActive: true,
    createdAt: now,
    updatedAt: now
  });

  // 3. Classes and Sections
  logger.info('3. Seeding Classes & Sections...');
  const classes = [
    { id: 'cls_10', name: 'Class 10', numericCode: 10, description: 'Secondary High School' },
    { id: 'cls_9',  name: 'Class 9',  numericCode: 9,  description: 'Secondary Middle School' },
    { id: 'cls_8',  name: 'Class 8',  numericCode: 8,  description: 'Junior Middle School' }
  ];

  for (const c of classes) {
    await firestore.collection('classes').doc(c.id).set({ ...c, createdAt: now, updatedAt: now });
  }

  const sections = [
    { id: 'sec_10_a', classId: 'cls_10', name: 'Section A', capacity: 40 },
    { id: 'sec_10_b', classId: 'cls_10', name: 'Section B', capacity: 40 },
    { id: 'sec_9_a',  classId: 'cls_9',  name: 'Section A', capacity: 40 }
  ];

  for (const s of sections) {
    await firestore.collection('sections').doc(s.id).set({ ...s, createdAt: now, updatedAt: now });
  }

  // 4. Subjects
  logger.info('4. Seeding Subjects...');
  const subjects = [
    { id: 'sub_math_10', classId: 'cls_10', name: 'Mathematics', code: 'MATH-10', type: 'THEORY' },
    { id: 'sub_sci_10',  classId: 'cls_10', name: 'Science & Physics', code: 'SCI-10', type: 'BOTH' },
    { id: 'sub_eng_10',  classId: 'cls_10', name: 'English Literature', code: 'ENG-10', type: 'THEORY' },
    { id: 'sub_cs_10',   classId: 'cls_10', name: 'Computer Science', code: 'CS-10', type: 'BOTH' }
  ];

  for (const sub of subjects) {
    await firestore.collection('subjects').doc(sub.id).set({ ...sub, createdAt: now, updatedAt: now });
  }

  // 5. Seed Core System Users with Secure Hashes
  logger.info('5. Seeding Default Accounts with Role-Based Permissions...');
  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  const users = [
    {
      uid: 'user_admin',
      email: 'admin@edurivo.edu',
      displayName: 'System Administrator',
      role: ROLES.ADMIN,
      status: 'ACTIVE',
      passwordHash: adminPasswordHash,
      customPermissions: ROLE_PERMISSIONS[ROLES.ADMIN]
    },
    {
      uid: 'tch_eleanor',
      email: 'teacher@edurivo.edu',
      displayName: 'Dr. Eleanor Gray',
      role: ROLES.TEACHER,
      status: 'ACTIVE',
      passwordHash: defaultPasswordHash,
      customPermissions: ROLE_PERMISSIONS[ROLES.TEACHER]
    },
    {
      uid: 'user_cashier',
      email: 'cashier@edurivo.edu',
      displayName: 'Marcus Vance (Cashier)',
      role: ROLES.CASHIER,
      status: 'ACTIVE',
      passwordHash: defaultPasswordHash,
      customPermissions: ROLE_PERMISSIONS[ROLES.CASHIER]
    },
    {
      uid: 'stu_liam',
      email: 'student@edurivo.edu',
      displayName: 'Liam Vance',
      role: ROLES.STUDENT,
      status: 'ACTIVE',
      passwordHash: defaultPasswordHash,
      customPermissions: ROLE_PERMISSIONS[ROLES.STUDENT]
    }
  ];

  for (const u of users) {
    await firestore.collection('users').doc(u.uid).set({ ...u, createdAt: now, updatedAt: now });
  }

  // 6. Teacher Profile
  logger.info('6. Seeding Teacher Profiles...');
  await firestore.collection('teachers').doc('tch_eleanor').set({
    id: 'tch_eleanor',
    teacherId: 'tch_eleanor',
    employeeId: 'EMP-2025-0001',
    name: 'Dr. Eleanor Gray',
    email: 'teacher@edurivo.edu',
    phone: '+1 (555) 349-8812',
    department: 'Mathematics',
    designation: 'Senior Faculty & HOD',
    salary: 5400,
    status: 'ACTIVE',
    assignedClasses: ['cls_10'],
    subjects: ['Mathematics'],
    createdAt: now,
    updatedAt: now
  });

  // 7. Student Profiles
  logger.info('7. Seeding Student Profiles...');
  const students = [
    {
      id: 'stu_liam',
      studentId: 'stu_liam',
      admissionNumber: 'ADM-2025-0001',
      firstName: 'Liam',
      middleName: 'Alexander',
      lastName: 'Vance',
      dateOfBirth: '2010-05-14',
      gender: 'MALE',
      bloodGroup: 'O+',
      email: 'student@edurivo.edu',
      phone: '+1 555-0199',
      address: '742 Evergreen Terrace, Metropolis',
      classId: 'cls_10',
      sectionId: 'sec_10_a',
      academicSessionId: 'session_2025_2026',
      rollNumber: '101',
      admissionDate: '2025-08-01',
      status: 'ACTIVE',
      parentName: 'Marcus Vance',
      parentPhone: '+1 555-0188',
      parentEmail: 'cashier@edurivo.edu',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'stu_sophia',
      studentId: 'stu_sophia',
      admissionNumber: 'ADM-2025-0002',
      firstName: 'Sophia',
      lastName: 'Patel',
      dateOfBirth: '2010-09-22',
      gender: 'FEMALE',
      bloodGroup: 'A+',
      email: 'sophia.patel@edurivo.edu',
      phone: '+1 555-0198',
      address: '12 Blossom Way, Metropolis',
      classId: 'cls_10',
      sectionId: 'sec_10_a',
      academicSessionId: 'session_2025_2026',
      rollNumber: '102',
      admissionDate: '2025-08-01',
      status: 'ACTIVE',
      parentName: 'Rohan Patel',
      parentPhone: '+1 555-0187',
      createdAt: now,
      updatedAt: now
    }
  ];

  for (const st of students) {
    await firestore.collection('students').doc(st.id).set({ ...st, isDeleted: false });
  }

  // 8. Fee Structure & Student Fee Obligations
  logger.info('8. Seeding Fee Structure & Student Dues...');
  const feeStructure = {
    id: 'fst_term1_2025',
    name: 'Term 1 Tuition & Lab Fee 2025-26',
    classId: 'cls_10',
    academicSessionId: 'session_2025_2026',
    totalAmount: 1200.00,
    dueDate: '2025-10-15',
    components: [
      { name: 'Tuition Fee', amount: 1000.00 },
      { name: 'Science & Lab Fee', amount: 200.00 }
    ],
    createdAt: now,
    updatedAt: now
  };
  await firestore.collection('feeStructures').doc(feeStructure.id).set(feeStructure);

  // Assign fee to Liam
  await firestore.collection('fees').doc('fee_liam_01').set({
    id: 'fee_liam_01',
    studentId: 'stu_liam',
    studentName: 'Liam Vance',
    admissionNumber: 'ADM-2025-0001',
    classId: 'cls_10',
    sectionId: 'sec_10_a',
    feeStructureId: 'fst_term1_2025',
    title: 'Term 1 Tuition & Lab Fee 2025-26',
    totalAmount: 1200.00,
    discount: 0,
    paidAmount: 400.00,
    balance: 800.00,
    dueDate: '2025-10-15',
    status: 'PARTIALLY_PAID',
    components: feeStructure.components,
    createdAt: now,
    updatedAt: now,
    isDeleted: false
  });

  // Assign fee to Sophia
  await firestore.collection('fees').doc('fee_sophia_01').set({
    id: 'fee_sophia_01',
    studentId: 'stu_sophia',
    studentName: 'Sophia Patel',
    admissionNumber: 'ADM-2025-0002',
    classId: 'cls_10',
    sectionId: 'sec_10_a',
    feeStructureId: 'fst_term1_2025',
    title: 'Term 1 Tuition & Lab Fee 2025-26',
    totalAmount: 1200.00,
    discount: 0,
    paidAmount: 1200.00,
    balance: 0.00,
    dueDate: '2025-10-15',
    status: 'PAID',
    components: feeStructure.components,
    createdAt: now,
    updatedAt: now,
    isDeleted: false
  });

  // 9. Receipts & Payments
  logger.info('9. Seeding Receipts & Payments...');
  const receiptLiam = {
    id: 'rcpt_2025_0001',
    receiptNumber: 'REC-2025-000001',
    paymentId: 'pay_2025_0001',
    studentId: 'stu_liam',
    studentName: 'Liam Vance',
    admissionNumber: 'ADM-2025-0001',
    className: 'Class 10',
    sectionName: 'Section A',
    feeId: 'fee_liam_01',
    feeTitle: 'Term 1 Tuition & Lab Fee 2025-26',
    amountPaid: 400.00,
    previousBalance: 1200.00,
    remainingBalance: 800.00,
    paymentMethod: 'CASH',
    transactionReference: 'CASH-COUNTER-01',
    cashierId: 'user_cashier',
    cashierName: 'Marcus Vance',
    date: '2025-08-15',
    createdAt: now,
    isDeleted: false
  };
  await firestore.collection('receipts').doc(receiptLiam.id).set(receiptLiam);

  await firestore.collection('payments').doc('pay_2025_0001').set({
    id: 'pay_2025_0001',
    receiptNumber: 'REC-2025-000001',
    receiptId: 'rcpt_2025_0001',
    studentId: 'stu_liam',
    amount: 400.00,
    paymentMethod: 'CASH',
    cashierId: 'user_cashier',
    feeId: 'fee_liam_01',
    createdAt: now,
    isDeleted: false
  });

  // 10. Examination & Results
  logger.info('10. Seeding Examination & Grade Sheets...');
  const exam = {
    id: 'exam_unit_1',
    name: 'Unit Assessment 1 (August 2025)',
    type: 'UNIT_TEST',
    academicSessionId: 'session_2025_2026',
    startDate: '2025-08-20',
    endDate: '2025-08-26',
    status: 'PUBLISHED',
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now
  };
  await firestore.collection('exams').doc(exam.id).set(exam);

  await firestore.collection('results').doc('res_liam_01').set({
    id: 'res_liam_01',
    examId: 'exam_unit_1',
    studentId: 'stu_liam',
    classId: 'cls_10',
    sectionId: 'sec_10_a',
    subjects: [
      { subjectId: 'sub_math_10', subjectName: 'Mathematics', maxMarks: 100, passMarks: 40, obtainedMarks: 92, grade: 'A+', passed: true },
      { subjectId: 'sub_sci_10', subjectName: 'Science & Physics', maxMarks: 100, passMarks: 40, obtainedMarks: 85, grade: 'A', passed: true }
    ],
    totalMax: 200,
    totalObtained: 177,
    percentage: 88.5,
    overallGrade: 'A',
    status: 'PASS',
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    isDeleted: false
  });

  // 11. Library & Inventory
  logger.info('11. Seeding Library Books & Inventory Items...');
  await firestore.collection('books').doc('bk_physics').set({
    id: 'bk_physics',
    title: 'University Physics with Modern Physics',
    author: 'Hugh D. Young',
    isbn: '978-0321973610',
    category: 'Science',
    totalCopies: 8,
    availableCopies: 8,
    status: 'AVAILABLE',
    createdAt: now,
    updatedAt: now
  });

  await firestore.collection('inventoryItems').doc('inv_paper_a4').set({
    id: 'inv_paper_a4',
    name: 'A4 White Copier Paper (500 Sheets)',
    category: 'Stationery',
    quantity: 45,
    minStockAlert: 10,
    unit: 'reams',
    createdAt: now,
    updatedAt: now
  });

  // 12. Notices
  logger.info('12. Seeding Official Announcements...');
  await firestore.collection('notices').doc('not_welcome').set({
    id: 'not_welcome',
    title: 'Welcome to Academic Year 2025-2026',
    targetAudience: 'ALL',
    content: 'All faculty, staff and students are welcomed to the new academic term. Orientation sessions commence at 08:30 AM.',
    publishedBy: 'System Administrator',
    authorId: 'user_admin',
    createdAt: now,
    updatedAt: now
  });

  // 13. Transport & Fleet
  logger.info('13. Seeding Transport Routes & Fleet...');
  await firestore.collection('transport').doc('trn_route_01').set({
    id: 'trn_route_01',
    routeName: 'Route A - North Valley Express',
    vehicleNumber: 'NY-SCH-4029',
    driverName: 'Robert Jenkins',
    driverPhone: '+1 (555) 234-8901',
    attendantName: 'Maria Santos',
    vehicleCapacity: 45,
    monthlyFee: 85.00,
    pickupTime: '07:15 AM',
    dropoffTime: '03:45 PM',
    stops: ['North Point Station', 'Maple Avenue Plaza', 'Oak Ridge Estates', 'Main Campus Gate'],
    assignedStudentsCount: 28,
    gpsCoordinates: { lat: 40.7128, lng: -74.0060, lastPing: now },
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now
  });

  // 14. Homework & Assignments
  logger.info('14. Seeding Homework Assignments & Submissions...');
  await firestore.collection('homework').doc('hw_sample_01').set({
    id: 'hw_sample_01',
    title: 'Chapter 5 Quadratic Equations Problem Set',
    classId: 'cls_10',
    className: 'Class 10',
    sectionId: 'sec_10_a',
    subjectId: 'sub_math_10',
    subjectName: 'Mathematics',
    dueDate: '2026-09-25',
    instructions: 'Complete exercises 1 through 15 on page 142. Show all step-by-step factorization proofs.',
    assignedBy: 'Dr. Eleanor Gray',
    status: 'ASSIGNED',
    createdAt: now,
    updatedAt: now
  });

  logger.info('Edurivo Database Seeding Completed Successfully! All services populated.');
}

if (require.main === module) {
  seed().then(() => {
    logger.info('Seed process finished successfully.');
    process.exit(0);
  }).catch(err => {
    logger.error('Seed process failed: %s', err.stack);
    process.exit(1);
  });
}

module.exports = seed;
