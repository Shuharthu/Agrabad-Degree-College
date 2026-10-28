/**
 * AGRABAD DEGREE COLLEGE - AUTHENTICATION MODULE
 * Handles Login, Registration, Session, Role Management, and Demo Logins.
 */

import { mockDb } from './mock-backend.js';

const AUTH_STORAGE_KEY = 'adc_auth_current_user_v1';

export class AuthService {
  constructor() {
    this.currentUser = this.loadSession();
  }

  loadSession() {
    if (typeof localStorage === 'undefined') return this.currentUser || null;
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  saveSession(user) {
    this.currentUser = user;
    if (typeof localStorage !== 'undefined') {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  // Login
  async login(email, password, roleHint = null) {
    const cleanEmail = email.trim().toLowerCase();
    const users = mockDb.getCollection('users');
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Allow demo password convenience
      if (cleanEmail.includes('student')) {
        user = users.find(u => u.role === 'student');
      } else if (cleanEmail.includes('teacher')) {
        user = users.find(u => u.role === 'teacher');
      } else if (cleanEmail.includes('admin')) {
        user = users.find(u => u.role === 'admin');
      }
    }

    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    if (user.status !== 'active') {
      throw new Error('This account has been deactivated. Please contact college administration.');
    }

    // Attach student or teacher profile
    const enrichedUser = { ...user };
    if (user.role === 'student') {
      const studentProfiles = mockDb.getCollection('studentProfiles');
      enrichedUser.profile = studentProfiles.find(s => s.userId === user.uid || s.email === user.email) || studentProfiles[0];
    } else if (user.role === 'teacher') {
      const teacherProfiles = mockDb.getCollection('teacherProfiles');
      enrichedUser.profile = teacherProfiles.find(t => t.userId === user.uid || t.email === user.email) || teacherProfiles[0];
    }

    this.saveSession(enrichedUser);
    mockDb.logAudit(enrichedUser, 'USER_LOGIN', `User signed into portal with role ${user.role}`);
    return enrichedUser;
  }

  // Quick Demo Login (for immediate review/testing)
  async demoLogin(role) {
    const users = mockDb.getCollection('users');
    const user = users.find(u => u.role === role);
    if (!user) throw new Error(`Demo account for ${role} not found.`);
    return this.login(user.email, 'demo123', role);
  }

  // Register New Student / Applicant Account
  async register({ fullName, email, password, mobile, program, department }) {
    const cleanEmail = email.trim().toLowerCase();
    const users = mockDb.getCollection('users');

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const newUid = 'user_' + Date.now();
    const newUser = {
      uid: newUid,
      email: cleanEmail,
      displayName: fullName,
      role: 'student',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    mockDb.insert('users', newUser);

    // Create corresponding Student Profile
    const studentCount = mockDb.getCollection('studentProfiles').length + 1;
    const newStudentId = `ADC2025${String(studentCount).padStart(3, '0')}`;

    const newProfile = {
      id: 'student_' + newUid,
      userId: newUid,
      studentId: newStudentId,
      fullName: fullName,
      email: cleanEmail,
      mobile: mobile,
      program: program || 'Higher Secondary (HSC)',
      department: department || 'Science',
      session: '2025 - 2026',
      semester: '1st Year',
      status: 'Active',
      attendancePercentage: 100,
      totalCourses: 5
    };

    mockDb.insert('studentProfiles', newProfile);

    newUser.profile = newProfile;
    this.saveSession(newUser);
    mockDb.logAudit(newUser, 'USER_REGISTER', `New student registered with ID ${newStudentId}`);
    return newUser;
  }

  // Password Reset simulation
  async resetPassword(email) {
    const cleanEmail = email.trim().toLowerCase();
    const users = mockDb.getCollection('users');
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('No account found with this email address.');
    }
    // Return simulated success
    return { success: true, message: `Password reset instructions have been dispatched to ${cleanEmail}.` };
  }

  // Logout
  logout() {
    const user = this.currentUser;
    if (user) {
      mockDb.logAudit(user, 'USER_LOGOUT', 'User signed out from portal');
    }
    this.saveSession(null);
    window.location.href = 'login.html';
  }
}

export const auth = new AuthService();
