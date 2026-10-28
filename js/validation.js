/**
 * AGRABAD DEGREE COLLEGE - FORM VALIDATION MODULE
 * Provides Bangladeshi educational data validations (Mobile, Board, GPA, HSC/SSC).
 */

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validateMobileBD(mobile) {
  const cleaned = String(mobile).replace(/[\s-]/g, '');
  // Validates BD 11-digit mobile starting with 01
  return /^01[3-9]\d{8}$/.test(cleaned);
}

export function validateGPA(gpa) {
  const val = parseFloat(gpa);
  return !isNaN(val) && val >= 1.0 && val <= 5.0;
}

export function validatePassingYear(year, minYear = 2015, maxYear = 2026) {
  const y = parseInt(year, 10);
  return !isNaN(y) && y >= minYear && y <= maxYear;
}

export function markFieldStatus(fieldEl, isValid, errorMessage = '') {
  const feedbackEl = fieldEl.parentElement.querySelector('.invalid-feedback');
  if (isValid) {
    fieldEl.classList.remove('is-invalid');
    if (feedbackEl) feedbackEl.textContent = '';
  } else {
    fieldEl.classList.add('is-invalid');
    if (feedbackEl) feedbackEl.textContent = errorMessage;
  }
  return isValid;
}
