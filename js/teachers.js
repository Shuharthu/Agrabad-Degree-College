/**
 * AGRABAD DEGREE COLLEGE - TEACHER PORTAL MODULE
 * Manages assigned courses, interactive attendance marking, and examination marks entry.
 */

import { mockDb } from './mock-backend.js';
import { auth } from './auth.js';
import { showToast } from './utilities.js';

export class TeacherPortal {
  constructor() {
    this.user = auth.getCurrentUser();
    this.teacher = null;
  }

  init() {
    if (!this.user) return;
    this.loadProfile();
    this.renderAssignedCourses();
    this.setupAttendanceRegister();
    this.setupMarksEntry();
  }

  loadProfile() {
    const teachers = mockDb.getCollection('teacherProfiles');
    this.teacher = teachers.find(t => t.userId === this.user.uid || t.email === this.user.email) || teachers[0];

    const nameEl = document.getElementById('teacher-profile-name');
    const desigEl = document.getElementById('teacher-profile-desig');
    const deptEl = document.getElementById('teacher-profile-dept');

    if (nameEl) nameEl.textContent = this.teacher.fullName;
    if (desigEl) desigEl.textContent = this.teacher.designation;
    if (deptEl) deptEl.textContent = this.teacher.department;
  }

  renderAssignedCourses() {
    const container = document.getElementById('teacher-courses-grid');
    if (!container) return;

    const courses = this.teacher.assignedCourses || [];
    container.innerHTML = courses.map(c => `
      <div class="card card-hover">
        <div class="card-body">
          <div class="d-flex justify-between align-center" style="margin-bottom: 0.5rem;">
            <span class="badge badge-review">${c.code}</span>
            <span class="badge badge-draft">${c.section}</span>
          </div>
          <h4 style="margin-bottom: 0.5rem;">${c.title}</h4>
          <p class="text-muted" style="font-size: 0.85rem;">Registered Students: 42</p>
          <div class="d-flex gap-2" style="margin-top: 1rem;">
            <button class="btn btn-outline-primary btn-sm w-100" onclick="window.scrollTo({top: 450, behavior: 'smooth'})">Mark Attendance</button>
            <button class="btn btn-navy btn-sm w-100" onclick="window.scrollTo({top: 900, behavior: 'smooth'})">Enter Marks</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  setupAttendanceRegister() {
    const studentListContainer = document.getElementById('attendance-roster-tbody');
    if (!studentListContainer) return;

    const students = mockDb.getCollection('studentProfiles');
    studentListContainer.innerHTML = students.map((s, idx) => `
      <tr data-student-id="${s.studentId}">
        <td>${idx + 1}</td>
        <td><strong>${s.studentId}</strong></td>
        <td>${s.fullName}</td>
        <td>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-outline-primary att-btn active" data-status="Present">Present</button>
            <button type="button" class="btn btn-sm btn-outline att-btn" data-status="Late">Late</button>
            <button type="button" class="btn btn-sm btn-outline att-btn" data-status="Absent">Absent</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Toggle status button styles
    studentListContainer.querySelectorAll('tr').forEach(row => {
      const btns = row.querySelectorAll('.att-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => {
            b.classList.remove('active', 'btn-outline-primary', 'btn-success', 'btn-danger', 'btn-warning');
            b.classList.add('btn-outline');
          });
          btn.classList.remove('btn-outline');
          const status = btn.getAttribute('data-status');
          if (status === 'Present') btn.classList.add('btn-success', 'active');
          else if (status === 'Late') btn.classList.add('btn-warning', 'active');
          else if (status === 'Absent') btn.classList.add('btn-danger', 'active');
        });
      });
    });

    const saveBtn = document.getElementById('btn-save-attendance');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const course = document.getElementById('att-select-course').value;
        const date = document.getElementById('att-select-date').value || new Date().toISOString().split('T')[0];
        
        studentListContainer.querySelectorAll('tr').forEach(row => {
          const studentId = row.getAttribute('data-student-id');
          const activeBtn = row.querySelector('.att-btn.active');
          const status = activeBtn ? activeBtn.getAttribute('data-status') : 'Present';

          mockDb.insert('attendance', {
            id: `att_${Date.now()}_${studentId}`,
            studentId,
            courseCode: course,
            date,
            status,
            markedBy: this.teacher.fullName
          });
        });

        mockDb.logAudit(this.user, 'MARK_ATTENDANCE', `Attendance marked for course ${course} on ${date}`);
        showToast('Attendance Saved', `Attendance for ${course} (${date}) recorded successfully.`, 'success');
      });
    }
  }

  setupMarksEntry() {
    const marksContainer = document.getElementById('marks-entry-tbody');
    if (!marksContainer) return;

    const students = mockDb.getCollection('studentProfiles');
    marksContainer.innerHTML = students.map((s, idx) => `
      <tr data-student-id="${s.studentId}" data-student-name="${s.fullName}">
        <td><strong>${s.studentId}</strong></td>
        <td>${s.fullName}</td>
        <td><input type="number" class="form-control ca-marks" min="0" max="30" value="26" style="width: 80px;"></td>
        <td><input type="number" class="form-control final-marks" min="0" max="70" value="62" style="width: 80px;"></td>
        <td><span class="total-marks fw-bold text-navy">88</span></td>
        <td><span class="badge badge-paid grade-badge">A+</span></td>
      </tr>
    `).join('');

    // Dynamic mark computation
    marksContainer.querySelectorAll('tr').forEach(row => {
      const caInput = row.querySelector('.ca-marks');
      const finalInput = row.querySelector('.final-marks');
      const totalEl = row.querySelector('.total-marks');
      const gradeEl = row.querySelector('.grade-badge');

      const recalc = () => {
        const ca = Math.min(30, Math.max(0, Number(caInput.value) || 0));
        const final = Math.min(70, Math.max(0, Number(finalInput.value) || 0));
        const total = ca + final;
        totalEl.textContent = total;

        let grade = 'F';
        let badgeClass = 'badge-danger';
        if (total >= 80) { grade = 'A+'; badgeClass = 'badge-paid'; }
        else if (total >= 70) { grade = 'A'; badgeClass = 'badge-paid'; }
        else if (total >= 60) { grade = 'A-'; badgeClass = 'badge-review'; }
        else if (total >= 50) { grade = 'B'; badgeClass = 'badge-warning'; }
        else if (total >= 40) { grade = 'C'; badgeClass = 'badge-warning'; }

        gradeEl.textContent = grade;
        gradeEl.className = `badge ${badgeClass} grade-badge`;
      };

      caInput.addEventListener('input', recalc);
      finalInput.addEventListener('input', recalc);
    });

    const submitMarksBtn = document.getElementById('btn-submit-marks');
    if (submitMarksBtn) {
      submitMarksBtn.addEventListener('click', () => {
        const course = document.getElementById('marks-select-course').value;
        const examName = document.getElementById('marks-select-exam').value;

        marksContainer.querySelectorAll('tr').forEach(row => {
          const studentId = row.getAttribute('data-student-id');
          const studentName = row.getAttribute('data-student-name');
          const total = Number(row.querySelector('.total-marks').textContent) || 0;
          const grade = row.querySelector('.grade-badge').textContent;

          let gpa = 0.0;
          if (grade === 'A+') gpa = 5.0;
          else if (grade === 'A') gpa = 4.0;
          else if (grade === 'A-') gpa = 3.5;
          else if (grade === 'B') gpa = 3.0;
          else if (grade === 'C') gpa = 2.0;

          mockDb.insert('results', {
            id: `res_${Date.now()}_${studentId}`,
            studentId,
            courseCode: course,
            courseName: course === 'MATH-101' ? 'Higher Mathematics I' : 'ICT & Computing',
            marks: total,
            grade,
            gpa,
            semester: examName,
            submittedBy: this.teacher.fullName
          });
        });

        mockDb.logAudit(this.user, 'SUBMIT_MARKS', `Submitted examination marks for ${course} (${examName})`);
        showToast('Marks Submitted', `Grades for ${course} submitted successfully to the Examination Controller.`, 'success');
      });
    }
  }
}
