/**
 * AGRABAD DEGREE COLLEGE - ROUTE GUARDS & ACCESS CONTROL
 * Enforces Role-Based Access Control (RBAC) on protected pages.
 */

import { auth } from './auth.js';

export function checkPageAccess(allowedRoles = []) {
  const user = auth.getCurrentUser();

  if (!user) {
    const returnUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `login.html?returnUrl=${returnUrl}`;
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect user to their own proper dashboard
    if (user.role === 'student') {
      window.location.href = 'student-dashboard.html';
    } else if (user.role === 'teacher') {
      window.location.href = 'teacher-dashboard.html';
    } else if (user.role === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'index.html';
    }
    return null;
  }

  return user;
}

export function initDashboardTopbar(user) {
  if (!user) return;

  const nameEls = document.querySelectorAll('.user-display-name, .topbar-user-name');
  nameEls.forEach(el => {
    el.textContent = user.displayName || 'Authorized User';
  });

  const roleEls = document.querySelectorAll('.user-role-badge, .topbar-user-role');
  roleEls.forEach(el => {
    el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  });

  const avatarEls = document.querySelectorAll('.topbar-avatar');
  avatarEls.forEach(el => {
    const initials = (user.displayName || user.email)
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    el.textContent = initials || 'AD';
  });

  // Attach logout buttons
  const logoutBtns = document.querySelectorAll('.btn-logout, .sidebar-logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      auth.logout();
    });
  });

  // Sidebar mobile toggle
  const sidebarToggle = document.querySelector('.sidebar-toggle-btn');
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  }
}
