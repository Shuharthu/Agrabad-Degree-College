/**
 * AGRABAD DEGREE COLLEGE - ADMISSION MANAGEMENT MODULE
 * Manages Multistep Application Form, Validation, Document Mock Uploads,
 * Reference Generation, and Live Status Tracking.
 */

import { mockDb } from './mock-backend.js';
import { validateEmail, validateMobileBD, validateGPA, markFieldStatus } from './validation.js';
import { generateRef, showToast, formatDate } from './utilities.js';

export class AdmissionManager {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.formData = {
      personal: {},
      academic: {},
      documents: {}
    };
  }

  initWizard() {
    this.setupStepNavigation();
    this.setupFileUploads();
    this.loadDraft();
  }

  setupStepNavigation() {
    const nextBtns = document.querySelectorAll('[data-wizard-next]');
    const prevBtns = document.querySelectorAll('[data-wizard-prev]');

    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.validateCurrentStep(this.currentStep)) {
          this.saveStepData(this.currentStep);
          this.goToStep(this.currentStep + 1);
        }
      });
    });

    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.goToStep(this.currentStep - 1);
      });
    });

    const submitBtn = document.getElementById('btn-submit-admission');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.submitApplication();
      });
    }
  }

  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.totalSteps) return;
    this.currentStep = stepNumber;

    // Update Progress Bar
    const percent = ((stepNumber - 1) / (this.totalSteps - 1)) * 100;
    const bar = document.querySelector('.wizard-progress-bar');
    if (bar) bar.style.width = `${percent}%`;

    // Update Step Indicators
    document.querySelectorAll('.wizard-step').forEach((el, idx) => {
      const stepIndex = idx + 1;
      el.classList.remove('active', 'completed');
      if (stepIndex === stepNumber) {
        el.classList.add('active');
      } else if (stepIndex < stepNumber) {
        el.classList.add('completed');
      }
    });

    // Update Step Panes
    document.querySelectorAll('.wizard-pane').forEach((pane, idx) => {
      if (idx + 1 === stepNumber) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // If reaching step 4 (Review), populate review fields
    if (stepNumber === 4) {
      this.populateReviewSummary();
    }

    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  validateCurrentStep(step) {
    let isValid = true;

    if (step === 1) {
      const fullName = document.getElementById('adm-fullname');
      const dob = document.getElementById('adm-dob');
      const gender = document.getElementById('adm-gender');
      const mobile = document.getElementById('adm-mobile');
      const email = document.getElementById('adm-email');
      const presentAddress = document.getElementById('adm-present-addr');
      const guardianName = document.getElementById('adm-guardian-name');

      if (!fullName.value.trim()) isValid = markFieldStatus(fullName, false, 'Please enter applicant full name.') && isValid;
      else markFieldStatus(fullName, true);

      if (!dob.value) isValid = markFieldStatus(dob, false, 'Date of birth is required.') && isValid;
      else markFieldStatus(dob, true);

      if (!gender.value) isValid = markFieldStatus(gender, false, 'Please select gender.') && isValid;
      else markFieldStatus(gender, true);

      if (!validateMobileBD(mobile.value)) isValid = markFieldStatus(mobile, false, 'Enter a valid 11-digit Bangladeshi mobile number.') && isValid;
      else markFieldStatus(mobile, true);

      if (!validateEmail(email.value)) isValid = markFieldStatus(email, false, 'Enter a valid email address.') && isValid;
      else markFieldStatus(email, true);

      if (!presentAddress.value.trim()) isValid = markFieldStatus(presentAddress, false, 'Present address is required.') && isValid;
      else markFieldStatus(presentAddress, true);

      if (!guardianName.value.trim()) isValid = markFieldStatus(guardianName, false, 'Guardian name is required.') && isValid;
      else markFieldStatus(guardianName, true);
    } 
    else if (step === 2) {
      const program = document.getElementById('adm-program');
      const dept = document.getElementById('adm-department');
      const sscBoard = document.getElementById('adm-ssc-board');
      const sscRoll = document.getElementById('adm-ssc-roll');
      const sscYear = document.getElementById('adm-ssc-year');
      const sscGpa = document.getElementById('adm-ssc-gpa');

      if (!program.value) isValid = markFieldStatus(program, false, 'Please select desired program.') && isValid;
      else markFieldStatus(program, true);

      if (!dept.value) isValid = markFieldStatus(dept, false, 'Please select department / group.') && isValid;
      else markFieldStatus(dept, true);

      if (!sscBoard.value) isValid = markFieldStatus(sscBoard, false, 'Please select SSC Board.') && isValid;
      else markFieldStatus(sscBoard, true);

      if (!sscRoll.value.trim()) isValid = markFieldStatus(sscRoll, false, 'Enter SSC Roll number.') && isValid;
      else markFieldStatus(sscRoll, true);

      if (!sscYear.value) isValid = markFieldStatus(sscYear, false, 'Select passing year.') && isValid;
      else markFieldStatus(sscYear, true);

      if (!validateGPA(sscGpa.value)) isValid = markFieldStatus(sscGpa, false, 'Enter valid GPA (1.00 - 5.00).') && isValid;
      else markFieldStatus(sscGpa, true);
    }

    if (!isValid) {
      showToast('Validation Error', 'Please complete all required fields correctly before proceeding.', 'danger');
    }

    return isValid;
  }

  saveStepData(step) {
    if (step === 1) {
      this.formData.personal = {
        fullName: document.getElementById('adm-fullname').value.trim(),
        dob: document.getElementById('adm-dob').value,
        gender: document.getElementById('adm-gender').value,
        mobile: document.getElementById('adm-mobile').value.trim(),
        email: document.getElementById('adm-email').value.trim(),
        presentAddress: document.getElementById('adm-present-addr').value.trim(),
        permanentAddress: document.getElementById('adm-perm-addr').value.trim() || document.getElementById('adm-present-addr').value.trim(),
        guardianName: document.getElementById('adm-guardian-name').value.trim(),
        guardianMobile: document.getElementById('adm-guardian-mobile').value.trim() || document.getElementById('adm-mobile').value.trim()
      };
    } else if (step === 2) {
      this.formData.academic = {
        program: document.getElementById('adm-program').value,
        department: document.getElementById('adm-department').value,
        session: '2025 - 2026',
        sscBoard: document.getElementById('adm-ssc-board').value,
        sscRoll: document.getElementById('adm-ssc-roll').value.trim(),
        sscYear: document.getElementById('adm-ssc-year').value,
        sscGpa: document.getElementById('adm-ssc-gpa').value.trim()
      };
    }
    // Auto-save draft in localStorage
    localStorage.setItem('adc_admission_draft', JSON.stringify(this.formData));
  }

  loadDraft() {
    const draft = localStorage.getItem('adc_admission_draft');
    if (!draft) return;
    try {
      const data = JSON.parse(draft);
      this.formData = data;
      if (data.personal) {
        if (data.personal.fullName) document.getElementById('adm-fullname').value = data.personal.fullName;
        if (data.personal.dob) document.getElementById('adm-dob').value = data.personal.dob;
        if (data.personal.gender) document.getElementById('adm-gender').value = data.personal.gender;
        if (data.personal.mobile) document.getElementById('adm-mobile').value = data.personal.mobile;
        if (data.personal.email) document.getElementById('adm-email').value = data.personal.email;
        if (data.personal.presentAddress) document.getElementById('adm-present-addr').value = data.personal.presentAddress;
        if (data.personal.guardianName) document.getElementById('adm-guardian-name').value = data.personal.guardianName;
      }
      if (data.academic) {
        if (data.academic.program) document.getElementById('adm-program').value = data.academic.program;
        if (data.academic.department) document.getElementById('adm-department').value = data.academic.department;
        if (data.academic.sscBoard) document.getElementById('adm-ssc-board').value = data.academic.sscBoard;
        if (data.academic.sscRoll) document.getElementById('adm-ssc-roll').value = data.academic.sscRoll;
        if (data.academic.sscYear) document.getElementById('adm-ssc-year').value = data.academic.sscYear;
        if (data.academic.sscGpa) document.getElementById('adm-ssc-gpa').value = data.academic.sscGpa;
      }
    } catch (e) {
      console.warn('Draft load failed', e);
    }
  }

  setupFileUploads() {
    const dropzones = document.querySelectorAll('.upload-dropzone');
    dropzones.forEach(zone => {
      const input = zone.querySelector('input[type="file"]');
      if (!input) return;

      input.addEventListener('change', () => {
        if (input.files && input.files[0]) {
          const file = input.files[0];
          zone.querySelector('.upload-text-name').textContent = `Attached: ${file.name} (${Math.round(file.size / 1024)} KB)`;
          zone.style.borderColor = 'var(--color-success)';
          zone.style.backgroundColor = 'var(--color-success-light)';
        }
      });
    });
  }

  populateReviewSummary() {
    const p = this.formData.personal;
    const a = this.formData.academic;

    document.getElementById('rev-fullname').textContent = p.fullName || 'N/A';
    document.getElementById('rev-mobile').textContent = p.mobile || 'N/A';
    document.getElementById('rev-email').textContent = p.email || 'N/A';
    document.getElementById('rev-dob').textContent = p.dob || 'N/A';
    document.getElementById('rev-address').textContent = p.presentAddress || 'N/A';
    document.getElementById('rev-guardian').textContent = p.guardianName || 'N/A';

    document.getElementById('rev-program').textContent = a.program || 'N/A';
    document.getElementById('rev-department').textContent = a.department || 'N/A';
    document.getElementById('rev-ssc-board').textContent = a.sscBoard || 'N/A';
    document.getElementById('rev-ssc-roll').textContent = a.sscRoll || 'N/A';
    document.getElementById('rev-ssc-gpa').textContent = a.sscGpa || 'N/A';
  }

  submitApplication() {
    const declaration = document.getElementById('adm-declaration');
    if (declaration && !declaration.checked) {
      showToast('Declaration Required', 'You must agree and confirm that all submitted information is accurate.', 'warning');
      return;
    }

    const refNumber = generateRef('ADC-2025-');
    const newApplication = {
      id: 'app_' + Date.now(),
      refNumber,
      fullName: this.formData.personal.fullName,
      email: this.formData.personal.email,
      mobile: this.formData.personal.mobile,
      dateOfBirth: this.formData.personal.dob,
      gender: this.formData.personal.gender,
      presentAddress: this.formData.personal.presentAddress,
      permanentAddress: this.formData.personal.permanentAddress,
      guardianName: this.formData.personal.guardianName,
      guardianMobile: this.formData.personal.guardianMobile,
      program: this.formData.academic.program,
      department: this.formData.academic.department,
      session: '2025 - 2026',
      sscBoard: this.formData.academic.sscBoard,
      sscRoll: this.formData.academic.sscRoll,
      sscYear: this.formData.academic.sscYear,
      sscGpa: this.formData.academic.sscGpa,
      status: 'Under Review',
      submittedAt: new Date().toISOString(),
      remarks: 'Application received and queued for committee evaluation.'
    };

    mockDb.insert('admissionApplications', newApplication);
    mockDb.logAudit({ displayName: newApplication.fullName, email: newApplication.email }, 'SUBMIT_ADMISSION', `New application submitted (${refNumber})`);
    
    // Clear draft
    localStorage.removeItem('adc_admission_draft');

    // Show success view with Reference Number
    const formContainer = document.getElementById('admission-form-container');
    const successContainer = document.getElementById('admission-success-container');
    if (formContainer && successContainer) {
      formContainer.style.display = 'none';
      successContainer.style.display = 'block';

      document.getElementById('success-ref-num').textContent = refNumber;
      document.getElementById('success-applicant-name').textContent = newApplication.fullName;
      document.getElementById('success-program-name').textContent = `${newApplication.program} (${newApplication.department})`;
    }

    showToast('Application Submitted!', `Your reference number is ${refNumber}. Save it to track status.`, 'success');
  }

  // Live status search function
  static trackStatus(query) {
    if (!query) return null;
    const cleanQuery = query.trim().toUpperCase();
    const apps = mockDb.getCollection('admissionApplications');
    return apps.find(a => 
      a.refNumber.toUpperCase() === cleanQuery || 
      a.mobile.replace(/[\s-]/g, '') === query.replace(/[\s-]/g, '') ||
      a.sscRoll === query.trim()
    );
  }
}
