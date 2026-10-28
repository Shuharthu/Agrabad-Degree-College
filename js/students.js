/**
 * AGRABAD DEGREE COLLEGE - STUDENT PORTAL MODULE
 * Manages personalized dashboard, schedule, routine, results, and ID Card printing.
 */

import { mockDb } from './mock-backend.js';
import { auth } from './auth.js';
import { formatBDT, formatDate } from './utilities.js';

export class StudentPortal {
  constructor() {
    this.user = auth.getCurrentUser();
    this.student = null;
  }

  init() {
    if (!this.user) return;
    this.loadProfile();
    this.renderStats();
    this.renderUpcomingClasses();
    this.renderRecentNotices();
    this.renderCourses();
    this.renderRoutine();
    this.renderResults();
    this.setupIDCardModal();
  }

  loadProfile() {
    const profiles = mockDb.getCollection('studentProfiles');
    this.student = profiles.find(s => s.userId === this.user.uid || s.email === this.user.email) || profiles[0];
    
    // Update student info in UI
    const idBadges = document.querySelectorAll('.student-id-display');
    idBadges.forEach(el => el.textContent = this.student.studentId || 'ADC2025001');

    const progBadges = document.querySelectorAll('.student-program-display');
    progBadges.forEach(el => el.textContent = `${this.student.program} - ${this.student.department}`);

    const sessionBadges = document.querySelectorAll('.student-session-display');
    sessionBadges.forEach(el => el.textContent = `Session: ${this.student.session}`);
  }

  renderStats() {
    const totalCoursesEl = document.getElementById('stat-total-courses');
    const attendanceEl = document.getElementById('stat-attendance');
    const pendingFeesEl = document.getElementById('stat-pending-fees');
    const noticesCountEl = document.getElementById('stat-notices-count');

    // Calculate pending fees from feeObligations
    const fees = mockDb.getCollection('feeObligations').filter(f => f.studentId === this.student.studentId && f.status === 'Pending');
    const totalPending = fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    const notices = mockDb.getCollection('notices');

    if (totalCoursesEl) totalCoursesEl.textContent = this.student.totalCourses || 5;
    if (attendanceEl) attendanceEl.textContent = `${this.student.attendancePercentage || 92}%`;
    if (pendingFeesEl) pendingFeesEl.textContent = formatBDT(totalPending);
    if (noticesCountEl) noticesCountEl.textContent = notices.length || 3;
  }

  renderUpcomingClasses() {
    const container = document.getElementById('upcoming-classes-body');
    if (!container) return;

    const routines = mockDb.getCollection('classRoutines').slice(0, 4);
    if (routines.length === 0) {
      container.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No classes scheduled for today.</td></tr>`;
      return;
    }

    container.innerHTML = routines.map(r => `
      <tr>
        <td>
          <span class="time-pill">
            <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="assets/icons/icons.svg#icon-clock"></use></svg>
            ${r.time}
          </span>
        </td>
        <td>
          <div class="fw-semibold text-navy">${r.subject}</div>
          <div class="text-muted" style="font-size: 0.78rem;">${r.teacher}</div>
        </td>
        <td>
          <span class="room-badge">${r.room}</span>
        </td>
        <td>
          <span class="badge badge-paid">Scheduled</span>
        </td>
      </tr>
    `).join('');
  }

  renderRecentNotices() {
    const container = document.getElementById('recent-notices-widget');
    if (!container) return;

    const notices = mockDb.getCollection('notices').slice(0, 3);
    container.innerHTML = notices.map(n => `
      <div class="notice-widget-item">
        <svg class="icon notice-pin-icon" viewBox="0 0 24 24"><use href="assets/icons/icons.svg#icon-bell"></use></svg>
        <div class="notice-widget-content">
          <h5>${n.title}</h5>
          <div class="notice-widget-meta">${formatDate(n.date)} • ${n.category}</div>
        </div>
      </div>
    `).join('');
  }

  renderCourses() {
    const container = document.getElementById('student-courses-container');
    if (!container) return;

    const courses = mockDb.getCollection('courses');
    container.innerHTML = courses.map(c => `
      <div class="card card-hover">
        <div class="card-body">
          <div class="d-flex justify-between align-center" style="margin-bottom: 0.75rem;">
            <span class="badge badge-review">${c.code}</span>
            <span class="text-muted" style="font-size: 0.8rem;">${c.credits} Credits</span>
          </div>
          <h4 style="margin-bottom: 0.5rem;">${c.name}</h4>
          <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1rem;">Faculty: ${c.teacher}</p>
          <div class="d-flex justify-between align-center" style="font-size: 0.85rem;">
            <span class="text-success fw-semibold">Enrolled</span>
            <a href="#" class="btn btn-outline btn-sm">Course Syllabus</a>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderRoutine() {
    const container = document.getElementById('student-routine-tbody');
    if (!container) return;

    const routines = mockDb.getCollection('classRoutines');
    container.innerHTML = routines.map(r => `
      <tr>
        <td><strong>${r.day}</strong></td>
        <td>${r.time}</td>
        <td>${r.subject}</td>
        <td><span class="room-badge">${r.room}</span></td>
        <td>${r.teacher}</td>
      </tr>
    `).join('');
  }

  renderResults() {
    const container = document.getElementById('student-results-tbody');
    if (!container) return;

    const results = mockDb.getCollection('results');
    container.innerHTML = results.map(r => `
      <tr>
        <td><strong>${r.courseCode}</strong></td>
        <td>${r.courseName}</td>
        <td>${r.marks} / 100</td>
        <td><span class="badge ${r.grade.includes('A') ? 'badge-paid' : 'badge-review'}">${r.grade}</span></td>
        <td><strong>${r.gpa.toFixed(2)}</strong></td>
        <td>${r.semester}</td>
      </tr>
    `).join('');
  }

  setupIDCardModal() {
    const triggerBtn = document.getElementById('btn-view-id-card');
    const modal = document.getElementById('modal-id-card');
    if (!triggerBtn || !modal) return;

    triggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('idcard-name').textContent = this.student.fullName;
      document.getElementById('idcard-id').textContent = this.student.studentId;
      document.getElementById('idcard-program').textContent = this.student.program;
      document.getElementById('idcard-dept').textContent = this.student.department;
      document.getElementById('idcard-session').textContent = this.student.session;
      document.getElementById('idcard-blood').textContent = this.student.bloodGroup || 'B+';
      modal.classList.add('active');
    });

    const printBtn = document.getElementById('btn-print-id-card');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }
}
