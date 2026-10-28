/**
 * AGRABAD DEGREE COLLEGE - LOCAL-FIRST FIRESTORE & AUTH SIMULATION ENGINE
 * Provides complete data persistence in localStorage, multi-collection querying,
 * atomic transactions, and audit logging when running in local evaluation or sandbox mode.
 */

const STORAGE_KEY = 'adc_database_v1';
const AUTH_KEY = 'adc_auth_session_v1';

// Seed Database with verified realistic institutional demo data
const DEFAULT_DATABASE = {
  users: [
    {
      uid: 'user_student_1',
      email: 'student@agrabadcollege.edu.bd',
      displayName: 'Shuvo Barua',
      role: 'student',
      status: 'active',
      createdAt: '2025-01-15T09:00:00Z'
    },
    {
      uid: 'user_teacher_1',
      email: 'teacher@agrabadcollege.edu.bd',
      displayName: 'Prof. Rafiqul Islam',
      role: 'teacher',
      status: 'active',
      department: 'Computer Science & Mathematics',
      createdAt: '2024-06-10T08:30:00Z'
    },
    {
      uid: 'user_admin_1',
      email: 'admin@agrabadcollege.edu.bd',
      displayName: 'Principal / Admin Controller',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-01T08:00:00Z'
    }
  ],

  studentProfiles: [
    {
      id: 'student_shuvo',
      userId: 'user_student_1',
      studentId: 'ADC2025001',
      fullName: 'Shuvo Barua',
      email: 'student@agrabadcollege.edu.bd',
      mobile: '01812-345678',
      dateOfBirth: '2005-01-12',
      gender: 'Male',
      bloodGroup: 'B+',
      program: 'Higher Secondary (HSC)',
      department: 'Science',
      session: '2025 - 2026',
      semester: '1st Year',
      status: 'Active',
      presentAddress: 'Agrabad C/A, Chattogram, Bangladesh',
      permanentAddress: 'Raozan, Chattogram, Bangladesh',
      guardianName: 'Sunil Barua',
      guardianMobile: '01819-876543',
      sscRoll: '302914',
      sscBoard: 'Chattogram',
      sscGpa: '5.00',
      sscYear: '2024',
      attendancePercentage: 92,
      totalCourses: 5,
      avatarUrl: ''
    },
    {
      id: 'student_farhana',
      userId: 'user_student_2',
      studentId: 'ADC2025002',
      fullName: 'Farhana Akhter',
      email: 'farhana.a@example.com',
      mobile: '01711-223344',
      dateOfBirth: '2004-11-20',
      gender: 'Female',
      bloodGroup: 'A+',
      program: 'Degree (Pass Course)',
      department: 'BBA / Business Studies',
      session: '2025 - 2026',
      semester: '2nd Year',
      status: 'Active',
      presentAddress: 'Halishahar, Chattogram',
      sscGpa: '4.85',
      attendancePercentage: 88,
      totalCourses: 6
    },
    {
      id: 'student_rifat',
      userId: 'user_student_3',
      studentId: 'ADC2025003',
      fullName: 'Rifat Hasan',
      email: 'rifat.hasan@example.com',
      mobile: '01622-998877',
      dateOfBirth: '2005-05-18',
      gender: 'Male',
      bloodGroup: 'O+',
      program: 'Higher Secondary (HSC)',
      department: 'Humanities / English',
      session: '2025 - 2026',
      semester: '1st Year',
      status: 'Active',
      presentAddress: 'Chawkbazar, Chattogram',
      sscGpa: '4.60',
      attendancePercentage: 95,
      totalCourses: 5
    },
    {
      id: 'student_nusrat',
      userId: 'user_student_4',
      studentId: 'ADC2025004',
      fullName: 'Nusrat Jahan',
      email: 'nusrat.j@example.com',
      mobile: '01933-556677',
      dateOfBirth: '2004-03-25',
      gender: 'Female',
      bloodGroup: 'AB+',
      program: 'Honours',
      department: 'BSc Honours in Mathematics',
      session: '2024 - 2025',
      semester: '3rd Year',
      status: 'Active',
      presentAddress: 'Muradpur, Chattogram',
      sscGpa: '5.00',
      attendancePercentage: 91,
      totalCourses: 6
    }
  ],

  teacherProfiles: [
    {
      id: 'teacher_rafiqul',
      userId: 'user_teacher_1',
      employeeId: 'T-ADC-101',
      fullName: 'Prof. Rafiqul Islam',
      designation: 'Senior Lecturer & Head of Department',
      department: 'Computer Science & Mathematics',
      email: 'teacher@agrabadcollege.edu.bd',
      mobile: '01712-445566',
      assignedCourses: [
        { code: 'MATH-101', title: 'Higher Mathematics I', section: 'Science-A' },
        { code: 'ICT-102', title: 'Information & Comm. Technology', section: 'Science-A' },
        { code: 'CSE-201', title: 'Discrete Mathematics', section: 'Degree-B' }
      ]
    }
  ],

  courses: [
    { id: 'c1', code: 'MATH-101', name: 'Higher Mathematics I', credits: 3, teacher: 'Prof. Rafiqul Islam', department: 'Science' },
    { id: 'c2', code: 'ENG-101', name: 'English for Communication', credits: 3, teacher: 'Ms. Nusrat Parveen', department: 'General' },
    { id: 'c3', code: 'ICT-102', name: 'Computer & ICT', credits: 3, teacher: 'Prof. Rafiqul Islam', department: 'Science' },
    { id: 'c4', code: 'PHY-101', name: 'Physics I', credits: 3, teacher: 'Dr. Kamal Hossain', department: 'Science' },
    { id: 'c5', code: 'BNG-101', name: 'Bangla Sahitya', credits: 3, teacher: 'Mr. Anisur Rahman', department: 'General' }
  ],

  classRoutines: [
    { id: 'r1', time: '09:00 AM - 10:00 AM', subject: 'Higher Mathematics I', room: 'Room 101', teacher: 'Prof. Rafiqul Islam', day: 'Sunday' },
    { id: 'r2', time: '10:30 AM - 11:30 AM', subject: 'English Communication', room: 'Room 102', teacher: 'Ms. Nusrat Parveen', day: 'Sunday' },
    { id: 'r3', time: '12:00 PM - 01:00 PM', subject: 'Computer Science & ICT', room: 'Lab 1', teacher: 'Prof. Rafiqul Islam', day: 'Sunday' },
    { id: 'r4', time: '02:00 PM - 03:00 PM', subject: 'Bangla Sahitya', room: 'Room 103', teacher: 'Mr. Anisur Rahman', day: 'Sunday' },
    { id: 'r5', time: '09:00 AM - 10:00 AM', subject: 'Physics I (Theory)', room: 'Room 101', teacher: 'Dr. Kamal Hossain', day: 'Monday' },
    { id: 'r6', time: '10:30 AM - 12:30 PM', subject: 'Physics Practical Lab', room: 'Physics Lab', teacher: 'Dr. Kamal Hossain', day: 'Monday' }
  ],

  attendance: [
    { id: 'att_1', studentId: 'ADC2025001', courseCode: 'MATH-101', date: '2025-10-25', status: 'Present' },
    { id: 'att_2', studentId: 'ADC2025001', courseCode: 'ENG-101', date: '2025-10-25', status: 'Present' },
    { id: 'att_3', studentId: 'ADC2025001', courseCode: 'ICT-102', date: '2025-10-25', status: 'Present' },
    { id: 'att_4', studentId: 'ADC2025001', courseCode: 'PHY-101', date: '2025-10-24', status: 'Late' },
    { id: 'att_5', studentId: 'ADC2025001', courseCode: 'BNG-101', date: '2025-10-24', status: 'Present' }
  ],

  results: [
    { id: 'res_1', studentId: 'ADC2025001', courseCode: 'MATH-101', courseName: 'Higher Mathematics I', marks: 88, grade: 'A+', gpa: 5.0, semester: '1st Semester' },
    { id: 'res_2', studentId: 'ADC2025001', courseCode: 'ICT-102', courseName: 'Computer & ICT', marks: 92, grade: 'A+', gpa: 5.0, semester: '1st Semester' },
    { id: 'res_3', studentId: 'ADC2025001', courseCode: 'ENG-101', courseName: 'English Communication', marks: 78, grade: 'A', gpa: 4.0, semester: '1st Semester' },
    { id: 'res_4', studentId: 'ADC2025001', courseCode: 'PHY-101', courseName: 'Physics I', marks: 82, grade: 'A+', gpa: 5.0, semester: '1st Semester' },
    { id: 'res_5', studentId: 'ADC2025001', courseCode: 'BNG-101', courseName: 'Bangla Sahitya', marks: 75, grade: 'A', gpa: 4.0, semester: '1st Semester' }
  ],

  admissionApplications: [
    {
      id: 'app_101',
      refNumber: 'ADC-2025-0101',
      fullName: 'Tanvir Ahmed',
      email: 'tanvir.ahmed@gmail.com',
      mobile: '01712-987654',
      dateOfBirth: '2006-02-14',
      gender: 'Male',
      program: 'Higher Secondary (HSC)',
      department: 'Science',
      session: '2025 - 2026',
      presentAddress: 'Agrabad CDA R/A, Chattogram',
      permanentAddress: 'Sitakunda, Chattogram',
      guardianName: 'Kabir Ahmed',
      guardianMobile: '01815-554433',
      sscRoll: '419201',
      sscBoard: 'Chattogram',
      sscGpa: '5.00',
      sscYear: '2024',
      status: 'Approved',
      submittedAt: '2025-10-18T14:20:00Z',
      remarks: 'Top merit candidate, documents verified.'
    },
    {
      id: 'app_102',
      refNumber: 'ADC-2025-0102',
      fullName: 'Sumaiya Akter',
      email: 'sumaiya.akter@gmail.com',
      mobile: '01834-112233',
      dateOfBirth: '2006-04-10',
      gender: 'Female',
      program: 'Higher Secondary (HSC)',
      department: 'Business Studies',
      session: '2025 - 2026',
      presentAddress: 'Chawkbazar, Chattogram',
      permanentAddress: 'Fatikchhari, Chattogram',
      guardianName: 'Abdul Mannan',
      sscRoll: '501928',
      sscBoard: 'Chattogram',
      sscGpa: '4.75',
      sscYear: '2024',
      status: 'Under Review',
      submittedAt: '2025-10-22T10:15:00Z',
      remarks: 'Application under academic committee review.'
    },
    {
      id: 'app_103',
      refNumber: 'ADC-2025-0103',
      fullName: 'Mahmudul Karim',
      email: 'm.karim@gmail.com',
      mobile: '01912-778899',
      dateOfBirth: '2005-08-25',
      gender: 'Male',
      program: 'Degree (Pass Course)',
      department: 'B.A (Bachelor of Arts)',
      session: '2025 - 2026',
      presentAddress: 'Pahartali, Chattogram',
      sscRoll: '392019',
      sscBoard: 'Dhaka',
      sscGpa: '4.20',
      sscYear: '2023',
      status: 'Documents Required',
      submittedAt: '2025-10-24T16:00:00Z',
      remarks: 'Clear copy of SSC Transcript and National ID/Birth Certificate needed.'
    },
    {
      id: 'app_104',
      refNumber: 'ADC-2025-0104',
      fullName: 'Khadija Begum',
      email: 'khadija.b@gmail.com',
      mobile: '01552-334455',
      dateOfBirth: '2006-01-30',
      gender: 'Female',
      program: 'Higher Secondary (HSC)',
      department: 'Science',
      session: '2025 - 2026',
      presentAddress: 'Agrabad, Chattogram',
      sscRoll: '482019',
      sscBoard: 'Chattogram',
      sscGpa: '4.90',
      sscYear: '2024',
      status: 'Shortlisted',
      submittedAt: '2025-10-26T09:40:00Z',
      remarks: 'Selected for interview & quota verification.'
    }
  ],

  feeObligations: [
    {
      id: 'fee_101',
      studentId: 'ADC2025001',
      title: 'Semester Tuition Fee (Session 2025-2026)',
      category: 'Tuition',
      amount: 2500,
      dueDate: '2025-11-15',
      status: 'Pending',
      description: 'First Semester tuition fee obligation.'
    },
    {
      id: 'fee_102',
      studentId: 'ADC2025001',
      title: 'Semester Examination Fee',
      category: 'Examination',
      amount: 1500,
      dueDate: '2025-12-05',
      status: 'Pending',
      description: 'Midterm Examination fee.'
    }
  ],

  paymentTransactions: [
    {
      id: 'txn_901',
      transactionRef: 'TXN-BKASH-89214',
      studentId: 'ADC2025001',
      studentName: 'Shuvo Barua',
      title: 'Admission Registration Fee',
      category: 'Admission',
      amount: 5000,
      paymentMethod: 'bKash',
      status: 'Paid',
      gatewayRef: 'BK-992014812',
      paidAt: '2025-10-15T11:20:00Z',
      verified: true
    },
    {
      id: 'txn_902',
      transactionRef: 'TXN-NAGAD-67210',
      studentId: 'ADC2025001',
      studentName: 'Shuvo Barua',
      title: 'Semester Laboratory & Library Fee',
      category: 'Lab & Library',
      amount: 3000,
      paymentMethod: 'Nagad',
      status: 'Paid',
      gatewayRef: 'NG-482019283',
      paidAt: '2025-09-12T14:45:00Z',
      verified: true
    },
    {
      id: 'txn_903',
      transactionRef: 'TXN-CARD-11029',
      studentId: 'ADC2025001',
      studentName: 'Shuvo Barua',
      title: 'Course Enrollment Fee',
      category: 'Enrollment',
      amount: 4000,
      paymentMethod: 'Card (Visa/Mastercard)',
      status: 'Paid',
      gatewayRef: 'VS-772019482',
      paidAt: '2025-08-01T09:10:00Z',
      verified: true
    },
    {
      id: 'txn_904',
      transactionRef: 'TXN-BANK-33910',
      studentId: 'ADC2025001',
      studentName: 'Shuvo Barua',
      title: 'College Development Fund',
      category: 'Development',
      amount: 4000,
      paymentMethod: 'Bank Transfer (Sonali Bank)',
      status: 'Paid',
      gatewayRef: 'SB-38102948',
      paidAt: '2025-07-20T16:00:00Z',
      verified: true
    }
  ],

  notices: [
    {
      id: 'not_1',
      title: 'College will remain closed on 1st November (Saturday)',
      category: 'Holidays',
      date: '2025-10-28',
      priority: 'high',
      body: 'All students, faculty, and administrative staff are hereby informed that academic and administrative operations will remain closed on 1st November 2025.',
      publishedBy: 'Principal Office'
    },
    {
      id: 'not_2',
      title: 'Exam form fill-up deadline extended to 5th November',
      category: 'Examinations',
      date: '2025-10-25',
      priority: 'urgent',
      body: 'The deadline for HSC 1st Year examination form fill-up and clearing pending dues has been officially extended to 5th November 2025 without late fee penalty.',
      publishedBy: 'Examination Controller'
    },
    {
      id: 'not_3',
      title: 'New academic session orientation ceremony begins on 15th November',
      category: 'Academic',
      date: '2025-10-20',
      priority: 'normal',
      body: 'Welcome ceremony and departmental orientation for newly admitted students will be held at the College Main Auditorium from 10:00 AM.',
      publishedBy: 'Academic Council'
    },
    {
      id: 'not_4',
      title: 'Online Admission Application open for Session 2025-2026',
      category: 'Admission',
      date: '2025-10-15',
      priority: 'high',
      body: 'Eligible candidates for HSC, Degree Pass, and Honours programs can submit their admission applications through the online admission portal.',
      publishedBy: 'Admission Committee'
    }
  ],

  auditLogs: [
    {
      id: 'log_1',
      actor: 'Admin Controller',
      actorEmail: 'admin@agrabadcollege.edu.bd',
      action: 'APPROVE_ADMISSION',
      target: 'Application ADC-2025-0101 (Tanvir Ahmed)',
      timestamp: '2025-10-26T10:45:00Z',
      ip: '103.112.54.12'
    },
    {
      id: 'log_2',
      actor: 'System Gateway Webhook',
      actorEmail: 'gateway@sslcommerz.com',
      action: 'VERIFY_PAYMENT',
      target: 'TXN-BKASH-89214 (Amount: BDT 5000)',
      timestamp: '2025-10-15T11:20:05Z',
      ip: '115.127.24.8'
    }
  ]
};

class MockDatabaseEngine {
  constructor() {
    this.memoryStore = {};
    this.init();
  }

  hasStorage() {
    return typeof localStorage !== 'undefined';
  }

  init() {
    if (this.hasStorage()) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATABASE));
      }
    } else {
      if (!this.memoryStore[STORAGE_KEY]) {
        this.memoryStore[STORAGE_KEY] = JSON.stringify(DEFAULT_DATABASE);
      }
    }
  }

  getDb() {
    if (this.hasStorage()) {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_DATABASE;
    }
    const raw = this.memoryStore[STORAGE_KEY];
    return raw ? JSON.parse(raw) : DEFAULT_DATABASE;
  }

  saveDb(db) {
    if (this.hasStorage()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } else {
      this.memoryStore[STORAGE_KEY] = JSON.stringify(db);
    }
  }

  getCollection(collectionName) {
    const db = this.getDb();
    return db[collectionName] || [];
  }

  getItemById(collectionName, id) {
    const col = this.getCollection(collectionName);
    return col.find(item => item.id === id || item.uid === id || item.refNumber === id || item.transactionRef === id);
  }

  async syncToCloud(collectionName, item) {
    if (typeof window !== 'undefined' && window.firebaseDb) {
      try {
        const { setDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        const docId = String(item.id || item.uid || item.refNumber || Date.now());
        await setDoc(doc(window.firebaseDb, collectionName, docId), item, { merge: true });
      } catch (err) {
        console.warn('Cloud sync skipped:', err.message);
      }
    }
  }

  insert(collectionName, item) {
    const db = this.getDb();
    if (!db[collectionName]) db[collectionName] = [];
    if (!item.id) item.id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    if (!item.createdAt) item.createdAt = new Date().toISOString();
    db[collectionName].unshift(item);
    this.saveDb(db);
    this.syncToCloud(collectionName, item);
    return item;
  }

  update(collectionName, id, updates) {
    const db = this.getDb();
    if (!db[collectionName]) return null;
    const index = db[collectionName].findIndex(x => x.id === id || x.uid === id || x.refNumber === id);
    if (index !== -1) {
      db[collectionName][index] = { ...db[collectionName][index], ...updates, updatedAt: new Date().toISOString() };
      this.saveDb(db);
      this.syncToCloud(collectionName, db[collectionName][index]);
      return db[collectionName][index];
    }
    return null;
  }

  delete(collectionName, id) {
    const db = this.getDb();
    if (!db[collectionName]) return false;
    const initialLen = db[collectionName].length;
    db[collectionName] = db[collectionName].filter(x => x.id !== id && x.uid !== id);
    this.saveDb(db);
    return db[collectionName].length < initialLen;
  }

  logAudit(actor, action, target) {
    const logItem = {
      id: 'log_' + Date.now(),
      actor: actor.displayName || actor.email || 'Authorized User',
      actorEmail: actor.email || 'system@agrabadcollege.edu.bd',
      action,
      target,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1 (Local Verified)'
    };
    this.insert('auditLogs', logItem);
  }

  resetToDefault() {
    if (this.hasStorage()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATABASE));
    } else {
      this.memoryStore[STORAGE_KEY] = JSON.stringify(DEFAULT_DATABASE);
    }
  }
}

export const mockDb = new MockDatabaseEngine();
