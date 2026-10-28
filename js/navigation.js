/**
 * AGRABAD DEGREE COLLEGE - NAVIGATION & GLOBAL APP CONTROLLER
 */

import { auth } from './auth.js';
import { initModals } from './utilities.js';

export function initGlobalNavigation() {
  initModals();

  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-toggle-btn');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // Sync auth state in public navbar
  const user = auth.getCurrentUser();
  const navActions = document.querySelector('.nav-actions');
  if (navActions) {
    if (user) {
      let targetDashboard = 'student-dashboard.html';
      if (user.role === 'teacher') targetDashboard = 'teacher-dashboard.html';
      if (user.role === 'admin') targetDashboard = 'admin-dashboard.html';

      navActions.innerHTML = `
        <a href="${targetDashboard}" class="btn btn-navy btn-sm">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="assets/icons/icons.svg#icon-dashboard"></use></svg>
          Dashboard (${user.role})
        </a>
        <button id="btn-public-logout" class="btn btn-outline btn-sm">Logout</button>
      `;

      document.getElementById('btn-public-logout')?.addEventListener('click', () => {
        auth.logout();
      });
    } else {
      navActions.innerHTML = `
        <a href="login.html" class="btn btn-outline btn-sm">Portal Login</a>
        <a href="admissions.html" class="btn btn-primary btn-sm">Apply Now</a>
      `;
    }
  }
}

// Auto init when loaded
document.addEventListener('DOMContentLoaded', () => {
  initGlobalNavigation();
});
