# Agrabad Degree College Management Information System (ADC-MIS)

[![Live Production](https://img.shields.io/badge/Production-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel)](https://agrabad-college.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Shuharthu%2FAgrabad--Degree--College-181717?style=for-the-badge&logo=github)](https://github.com/Shuharthu/Agrabad-Degree-College)

A complete, responsive, full-stack College Management System engineered for **Agrabad Degree College**, Chattogram, Bangladesh (Established 1995).

---

## 🏛️ Brand Identity & Design System

The system features original vector branding assets created specifically for Agrabad Degree College, adhering to authentic academic traditions:

- **Primary Colors**: Academic Navy Blue (`#0c2340`, `#071733`), Royal Blue (`#1a56db`), Crisp White (`#ffffff`), and Warm Academic Gold (`#d97706`, `#fbbf24`).
- **Academic Crest**: Incorporates an open book of knowledge, graduation mortarboard with gold tassel, flaming torch of enlightenment, laurel wreath of distinction, and "EST. 1995" ribbon.
- **Logo Variations**:
  - `assets/logo/logo-full.svg`: Full institutional crest with serif wordmark and tagline *"LEARN • GROW • BUILD YOUR FUTURE"*.
  - `assets/logo/logo-crest.svg`: Compact academic crest for badges, watermarks, and verification stamps.
  - `assets/logo/logo-sidebar.svg`: Horizontal orientation optimized for desktop navigation sidebars and headers.
  - `assets/logo/favicon.svg`: High-resolution browser favicon.
- **Campus Visuals**: Custom architectural illustration of the multi-storied Agrabad campus building (`assets/images/campus-hero.svg`).

---

## 🚀 Core Features & Modules

### 1. Public Institutional Portal
- **Homepage (`index.html`)**: Features the academic hero section, announcement marquee ticker, core feature highlights, programs overview, quick portal links, latest circulars, and verified contact footer.
- **About the College (`about.html`)**: Detailed history, vision, core mission, Principal's message, and BISE Chattogram accreditation.
- **Academic Programs (`programs.html`)**: Higher Secondary (HSC Science, Commerce, Humanities), Degree Pass (B.A, B.Sc, B.S.S), and Honours degree curricula with minimum GPA requirements.
- **Official Notice Board (`notices.html`)**: Searchable and filterable notices with category tabs (Academic, Examinations, Admission, Holidays) and modal view.
- **Contact Us (`contact.html`)**: Campus address in Agrabad Commercial Area, Chattogram, telephone lines, and enquiry dispatch form.

### 2. New Admission Management Portal
- **Multistep Application Form (`admissions.html`)**:
  - **Step 1: Personal Info**: Full Name, DOB, Gender, Mobile, Email, Present & Permanent Addresses, Guardian details.
  - **Step 2: Academic Info**: Desired Program, Department, SSC Board, Roll Number, Passing Year, and GPA validation.
  - **Step 3: Document Attachments**: Scanned photo, transcript, birth certificate, and testimonial dropzones.
  - **Step 4: Review & Submit**: Summary verification, applicant declaration checkbox, auto-generation of unique Application Reference (`ADC-2025-XXXX`).
  - **Draft Autosave**: Preserves application progress in browser storage.
- **Live Status Tracker (`admission-status.html`)**: Applicants query their Reference Number to view current status (`Under Review`, `Shortlisted`, `Documents Required`, `Approved`, `Rejected`), committee remarks, and print confirmation slips.

### 3. Student Dashboard (`student-dashboard.html`)
- Personalized topbar greeting (*"Welcome back, Shuvo!"*) with student ID and role badge.
- Summary KPI Cards: Total Courses (5), Attendance (92%), Pending Fees (৳ 2,500), Notices (3).
- Upcoming Classes timetable and Recent Notices preview.
- Quick action triggers: Apply for Admission, Pay Fees, View Results, Download Student Photo ID Card.
- Printable Official Student Photo ID Card modal with barcode.

### 4. Fee Management & Payment Gateway (`payments.html`)
- Displays outstanding balance with itemized breakdown.
- Payment method selector: **bKash**, **Nagad**, **Card (Visa/Mastercard)**, and **Sonali Bank**.
- High-fidelity sandbox checkout modal simulating mobile wallet confirmation, OTP (123456), and PIN verification.
- **Idempotent ledger update**: Updates the fee status and writes a verified transaction to `paymentTransactions`.
- **Printable Official Money Receipt**: Generates verified voucher with institution header, student ID, item description, authorized stamp, and print capability.

### 5. Teacher & Faculty Portal (`teacher-dashboard.html`)
- Profile overview: Designation and assigned departments.
- Assigned courses and section cards.
- **Interactive Attendance Register**: Select subject and date, view roster, mark Present/Late/Absent with real-time feedback, and save records.
- **Semester Marks Entry**: Input Continuous Assessment (30) and Final Exam (70), with automatic Grade Point (GPA) and Letter Grade (A+, A, B, etc.) computation.

### 6. Administration Console (`admin-dashboard.html`)
- Live institutional metrics: Total Students (1,248), Applications (86), Awaiting Review (14), Active Teachers (42), Collected Fees (৳ 3,450,000), Outstanding Dues (৳ 420,000).
- **Student Management**: Filterable and searchable student table with "+ Add Student" modal, account deactivation/archival, and details view.
- **Admission Applications Queue**: Review applicant records, update statuses, record remarks, and *"Approve & Convert to Student"*.
- **Financial Audit Ledger**: Review verified payment transactions.
- **Notice Publishing Console**: Publish new circulars with priority tags.
- **Tamper-Proof Audit Logs**: Tracks actor, action type, target record, timestamp, and IP address.

### 7. Profile Management (`profile.html`)
- Student / staff profile header with avatar and session badge.
- Tabbed view: Personal Info, Academic Info, and Contact & Security.

---

## 🔑 Demo Accounts for Immediate Testing

The system includes pre-seeded demo accounts with one-click quick switchers on the login page (`login.html`):

| Role | Email / ID | Password | Access / Features |
| :--- | :--- | :--- | :--- |
| **Student** | `student@agrabadcollege.edu.bd` | `demo123` | Student Dashboard, Schedule, Routine, Results, Payments, ID Card |
| **Teacher** | `teacher@agrabadcollege.edu.bd` | `demo123` | Teacher Portal, Assigned Classes, Attendance Marking, Marks Entry |
| **Administrator** | `admin@agrabadcollege.edu.bd` | `demo123` | Admin Console, Student Management, Admission Approval, Ledger, Audits |

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: HTML5 (Semantic), CSS3 (Modern custom variables, responsive grid/flexbox, print stylesheets), Vanilla JavaScript (ES6 Modules). Zero heavy framework dependencies.
- **Database & Storage**: Dual-mode engine:
  - **Local Sandbox Engine (`js/mock-backend.js`)**: Runs fully offline or locally with data persistence in `localStorage`, reactive multi-collection CRUD, and audit logging.
  - **Firebase v10+ Modular SDK (`js/firebase-config.js`)**: Connects to Cloud Firestore and Firebase Auth when live credentials are provided.
- **Security**:
  - `firestore.rules`: Strict role-based security rules (Deny all by default, student-isolated reads, admin-only role updates, immutable audit logs and payment records).
  - `storage.rules`: Type-checked (images/PDF) and file-size limited uploads.
  - `firestore.indexes.json`: Composite indexes for admissions, fees, and attendance queries.
- **Privileged Backend**:
  - `functions/index.js`: Firebase Cloud Functions for SSLCommerz payment initiation, server-to-server IPN verification webhook, idempotent payment ledger updates, and RBAC custom claims.

---

## 💻 How to Run Locally

Because the project is built with standard Web Standards and ES Modules:

1. **Option A: Using Python (Recommended)**
   ```powershell
   cd C:\Users\UESR\.gemini\antigravity\scratch\agrabad-college
   python -m http.server 8000
   ```
   Open your browser at: `http://localhost:8000`

2. **Option B: Using Node / npx serve**
   ```powershell
   npx serve .
   ```

3. **Option C: Using Live Server (VS Code / Antigravity)**
   Right-click `index.html` and select **Open with Live Server**.

---

## 💳 Payment Gateway Architecture (SSLCommerz Bangladesh)

1. Authenticated student selects a payable fee.
2. Backend function `initiateSSLCommerzPayment` validates student ID, amount, and generates a unique transaction reference (`ADC-PAY-XXXX`).
3. Pending record is written to `paymentTransactions` with status `Pending`.
4. User completes payment via gateway (bKash/Nagad/Cards).
5. Gateway server calls trusted `sslcommerzIPNWebhook` (`/api/sslcommerz/ipn`).
6. Webhook verifies transaction parameters against the SSLCommerz validation API.
7. Atomic Firestore transaction:
   - Sets transaction status to `Paid`.
   - Marks fee obligation as `Paid`.
   - Generates official money receipt document in `paymentReceipts`.
8. Receipts are immediately accessible to the student and viewable in the Admin ledger.

---

## 🛡️ Security & Integrity Checklist

- [x] Client code cannot assign privileged roles (`admin`/`teacher`).
- [x] Payment verification is server-side and idempotent; duplicate callbacks do not double-count fees.
- [x] Sensitive operations are logged in `auditLogs`.
- [x] Passwords and payment card details are never stored in client-accessible Firestore documents.
- [x] All responsive layouts tested for desktop, tablet, and mobile breakpoints.
