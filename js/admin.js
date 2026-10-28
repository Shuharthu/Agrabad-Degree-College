/**
 * AGRABAD DEGREE COLLEGE - ADMINISTRATION MODULE
 * Covers KPI Metrics, Student Management, Admission Approval, Finance,
 * Notice Publishing, and Security Audit Logs.
 */

import { mockDb } from './mock-backend.js';
import { auth } from './auth.js';
import { formatBDT, formatDate, showToast, openModal, closeModal } from './utilities.js';

export class AdminController {
  constructor() {
    this.user = auth.getCurrentUser();
  }

  init() {
    if (!this.user) return;
    this.renderMetrics();
    this.renderStudents();
    this.renderAdmissions();
    this.renderFinance();
    this.renderAuditLogs();
    this.setupAddStudentModal();
    this.setupNoticePublisher();
  }

  renderMetrics() {
    const students = mockDb.getCollection('studentProfiles');
    const apps = mockDb.getCollection('admissionApplications');
    const pendingApps = apps.filter(a => a.status === 'Under Review' || a.status === 'Documents Required');
    const teachers = mockDb.getCollection('teacherProfiles');
    const txns = mockDb.getCollection('paymentTransactions');

    const totalCollected = txns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) + 3450000;
    const totalDues = 420000;

    const elTotalStudents = document.getElementById('metric-total-students');
    const elNewApps = document.getElementById('metric-new-apps');
    const elPendingApps = document.getElementById('metric-pending-apps');
    const elTeachers = document.getElementById('metric-teachers');
    const elCollected = document.getElementById('metric-collected-fees');
    const elOutstanding = document.getElementById('metric-outstanding-fees');

    if (elTotalStudents) elTotalStudents.textContent = (students.length + 1244).toLocaleString();
    if (elNewApps) elNewApps.textContent = apps.length + 82;
    if (elPendingApps) elPendingApps.textContent = pendingApps.length + 10;
    if (elTeachers) elTeachers.textContent = teachers.length + 41;
    if (elCollected) elCollected.textContent = formatBDT(totalCollected);
    if (elOutstanding) elOutstanding.textContent = formatBDT(totalDues);
  }

  renderStudents(filterText = '') {
    const tbody = document.getElementById('admin-students-tbody');
    if (!tbody) return;

    let students = mockDb.getCollection('studentProfiles');
    if (filterText) {
      const q = filterText.toLowerCase();
      students = students.filter(s => 
        s.fullName.toLowerCase().includes(q) || 
        s.studentId.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }

    tbody.innerHTML = students.map(s => `
      <tr>
        <td><strong>${s.studentId}</strong></td>
        <td>
          <div class="fw-semibold text-navy">${s.fullName}</div>
          <div class="text-muted" style="font-size: 0.78rem;">${s.email}</div>
        </td>
        <td>${s.program} (${s.department})</td>
        <td>${s.session}</td>
        <td><span class="badge ${s.status === 'Active' ? 'badge-paid' : 'badge-danger'}">${s.status}</span></td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-outline btn-sm btn-icon-only view-student-btn" data-id="${s.studentId}" title="View Details">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="assets/icons/icons.svg#icon-eye"></use></svg>
            </button>
            <button class="btn btn-outline-danger btn-sm btn-icon-only archive-student-btn" data-id="${s.studentId}" title="Deactivate">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="assets/icons/icons.svg#icon-trash"></use></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach search event
    const searchInput = document.getElementById('search-students-input');
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = 'true';
      searchInput.addEventListener('input', (e) => {
        this.renderStudents(e.target.value);
      });
    }

    // Attach archive event
    tbody.querySelectorAll('.archive-student-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm(`Are you sure you want to deactivate student account ${id}?`)) {
          mockDb.update('studentProfiles', id, { status: 'Deactivated' });
          mockDb.logAudit(this.user, 'ARCHIVE_STUDENT', `Deactivated student record ${id}`);
          showToast('Account Deactivated', `Student account ${id} has been deactivated.`, 'warning');
          this.renderStudents();
        }
      });
    });
  }

  setupAddStudentModal() {
    const btnOpen = document.getElementById('btn-open-add-student');
    const modal = document.getElementById('modal-add-student');
    const form = document.getElementById('form-add-student');
    if (!btnOpen || !modal || !form) return;

    btnOpen.addEventListener('click', () => openModal('modal-add-student'));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const count = mockDb.getCollection('studentProfiles').length + 1;
      const newId = `ADC2025${String(count).padStart(3, '0')}`;

      const name = document.getElementById('new-std-name').value.trim();
      const email = document.getElementById('new-std-email').value.trim();
      const mobile = document.getElementById('new-std-mobile').value.trim();
      const program = document.getElementById('new-std-program').value;
      const dept = document.getElementById('new-std-dept').value;

      mockDb.insert('studentProfiles', {
        id: 'student_' + Date.now(),
        userId: 'user_' + Date.now(),
        studentId: newId,
        fullName: name,
        email,
        mobile,
        program,
        department: dept,
        session: '2025 - 2026',
        semester: '1st Year',
        status: 'Active',
        attendancePercentage: 100,
        totalCourses: 5
      });

      mockDb.logAudit(this.user, 'CREATE_STUDENT', `Created new student record for ${name} (${newId})`);
      closeModal('modal-add-student');
      form.reset();
      showToast('Student Added', `Student ${name} successfully registered with ID ${newId}`, 'success');
      this.renderStudents();
      this.renderMetrics();
    });
  }

  renderAdmissions() {
    const tbody = document.getElementById('admin-admissions-tbody');
    if (!tbody) return;

    const apps = mockDb.getCollection('admissionApplications');
    tbody.innerHTML = apps.map(a => {
      let badgeClass = 'badge-review';
      if (a.status === 'Approved') badgeClass = 'badge-paid';
      else if (a.status === 'Rejected') badgeClass = 'badge-danger';
      else if (a.status === 'Shortlisted') badgeClass = 'badge-shortlisted';
      else if (a.status === 'Documents Required') badgeClass = 'badge-warning';

      return `
        <tr>
          <td><strong>${a.refNumber}</strong></td>
          <td>
            <div class="fw-semibold text-navy">${a.fullName}</div>
            <div class="text-muted" style="font-size: 0.78rem;">${a.mobile}</div>
          </td>
          <td>${a.program} (${a.department})</td>
          <td><span class="fw-bold">${a.sscGpa}</span> (${a.sscBoard})</td>
          <td><span class="badge ${badgeClass}">${a.status}</span></td>
          <td>
            <button class="btn btn-outline-primary btn-sm review-app-btn" data-id="${a.refNumber}">
              Review
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach review modal triggers
    tbody.querySelectorAll('.review-app-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.getAttribute('data-id');
        this.openReviewModal(ref);
      });
    });
  }

  openReviewModal(refNumber) {
    const app = mockDb.getItemById('admissionApplications', refNumber);
    if (!app) return;

    document.getElementById('rev-modal-ref').textContent = app.refNumber;
    document.getElementById('rev-modal-name').textContent = app.fullName;
    document.getElementById('rev-modal-program').textContent = `${app.program} (${app.department})`;
    document.getElementById('rev-modal-mobile').textContent = app.mobile;
    document.getElementById('rev-modal-ssc').textContent = `Roll: ${app.sscRoll} | Board: ${app.sscBoard} | GPA: ${app.sscGpa} | Year: ${app.sscYear}`;
    document.getElementById('rev-modal-address').textContent = app.presentAddress;
    document.getElementById('rev-modal-remarks').value = app.remarks || '';
    document.getElementById('rev-modal-status-select').value = app.status;

    // Save decision button
    const saveBtn = document.getElementById('btn-save-admission-decision');
    saveBtn.onclick = () => {
      const newStatus = document.getElementById('rev-modal-status-select').value;
      const remarks = document.getElementById('rev-modal-remarks').value.trim();

      mockDb.update('admissionApplications', app.id, { status: newStatus, remarks });
      mockDb.logAudit(this.user, 'UPDATE_ADMISSION_STATUS', `Updated application ${app.refNumber} to ${newStatus}`);

      // If Approved, convert to student if not already done
      if (newStatus === 'Approved') {
        const existingStudent = mockDb.getCollection('studentProfiles').find(s => s.email === app.email);
        if (!existingStudent) {
          const count = mockDb.getCollection('studentProfiles').length + 1;
          const newStudentId = `ADC2025${String(count).padStart(3, '0')}`;
          mockDb.insert('studentProfiles', {
            id: 'student_' + Date.now(),
            userId: 'user_' + Date.now(),
            studentId: newStudentId,
            fullName: app.fullName,
            email: app.email,
            mobile: app.mobile,
            dateOfBirth: app.dateOfBirth,
            gender: app.gender,
            program: app.program,
            department: app.department,
            session: '2025 - 2026',
            semester: '1st Year',
            status: 'Active',
            attendancePercentage: 100,
            totalCourses: 5
          });
          showToast('Student Enrolled!', `Applicant ${app.fullName} has been granted Student ID: ${newStudentId}`, 'success');
        }
      }

      closeModal('modal-review-admission');
      showToast('Status Updated', `Application ${app.refNumber} marked as ${newStatus}`, 'success');
      this.renderAdmissions();
      this.renderStudents();
      this.renderMetrics();
    };

    openModal('modal-review-admission');
  }

  renderFinance() {
    const tbody = document.getElementById('admin-finance-tbody');
    if (!tbody) return;

    const txns = mockDb.getCollection('paymentTransactions');
    tbody.innerHTML = txns.map(t => `
      <tr>
        <td><strong>${t.transactionRef}</strong></td>
        <td>
          <div class="fw-semibold text-navy">${t.studentName}</div>
          <div class="text-muted" style="font-size: 0.78rem;">${t.studentId}</div>
        </td>
        <td>${t.title}</td>
        <td><strong>${formatBDT(t.amount)}</strong></td>
        <td>${t.paymentMethod}</td>
        <td>${formatDate(t.paidAt)}</td>
        <td><span class="badge badge-paid">Verified</span></td>
      </tr>
    `).join('');
  }

  renderAuditLogs() {
    const tbody = document.getElementById('admin-audit-tbody');
    if (!tbody) return;

    const logs = mockDb.getCollection('auditLogs');
    tbody.innerHTML = logs.map(l => `
      <tr>
        <td>${formatDate(l.timestamp)}</td>
        <td>
          <div class="fw-semibold text-navy">${l.actor}</div>
          <div class="text-muted" style="font-size: 0.75rem;">${l.actorEmail}</div>
        </td>
        <td><span class="badge badge-draft">${l.action}</span></td>
        <td>${l.target}</td>
        <td><code style="font-size: 0.78rem;">${l.ip}</code></td>
      </tr>
    `).join('');
  }

  setupNoticePublisher() {
    const form = document.getElementById('form-publish-notice');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('notice-pub-title').value.trim();
      const category = document.getElementById('notice-pub-cat').value;
      const priority = document.getElementById('notice-pub-priority').value;
      const body = document.getElementById('notice-pub-body').value.trim();

      mockDb.insert('notices', {
        id: 'not_' + Date.now(),
        title,
        category,
        priority,
        body,
        date: new Date().toISOString().split('T')[0],
        publishedBy: 'College Administration'
      });

      mockDb.logAudit(this.user, 'PUBLISH_NOTICE', `Published official notice: "${title}"`);
      form.reset();
      showToast('Notice Published', 'Official notice is now live on the student portal and public website.', 'success');
      this.renderMetrics();
    });
  }
}
