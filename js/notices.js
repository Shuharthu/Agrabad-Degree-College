/**
 * AGRABAD DEGREE COLLEGE - NOTICES BOARD MODULE
 */

import { mockDb } from './mock-backend.js';
import { formatDate, openModal } from './utilities.js';

export class NoticeBoard {
  constructor() {
    this.currentCategory = 'All';
    this.searchQuery = '';
  }

  init() {
    this.renderNotices();
    this.setupFilters();
  }

  setupFilters() {
    const filterBtns = document.querySelectorAll('.notice-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active', 'btn-navy'));
        btn.classList.add('active', 'btn-navy');
        this.currentCategory = btn.getAttribute('data-cat');
        this.renderNotices();
      });
    });

    const searchInput = document.getElementById('notice-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderNotices();
      });
    }
  }

  renderNotices() {
    const container = document.getElementById('notices-list-container');
    if (!container) return;

    let notices = mockDb.getCollection('notices');

    if (this.currentCategory !== 'All') {
      notices = notices.filter(n => n.category.toLowerCase() === this.currentCategory.toLowerCase());
    }

    if (this.searchQuery) {
      notices = notices.filter(n => 
        n.title.toLowerCase().includes(this.searchQuery) || 
        n.body.toLowerCase().includes(this.searchQuery) ||
        n.category.toLowerCase().includes(this.searchQuery)
      );
    }

    if (notices.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="icon empty-state-icon" viewBox="0 0 24 24"><use href="assets/icons/icons.svg#icon-bell"></use></svg>
          <div class="empty-state-title">No Notices Found</div>
          <p class="empty-state-text">There are currently no circulars or notices matching your selected criteria.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = notices.map(n => `
      <div class="card card-hover" style="margin-bottom: 1.25rem;">
        <div class="card-body">
          <div class="d-flex justify-between align-center" style="margin-bottom: 0.5rem;">
            <span class="badge ${n.priority === 'urgent' ? 'badge-danger' : n.priority === 'high' ? 'badge-warning' : 'badge-review'}">
              ${n.category}
            </span>
            <span class="text-muted" style="font-size: 0.8125rem;">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="assets/icons/icons.svg#icon-calendar"></use></svg>
              ${formatDate(n.date)}
            </span>
          </div>
          <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--color-navy);">${n.title}</h3>
          <p class="text-muted" style="font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem;">${n.body}</p>
          <div class="d-flex justify-between align-center" style="border-top: 1px solid var(--color-slate-200); padding-top: 0.75rem; font-size: 0.8125rem;">
            <span class="text-muted">Issued by: <strong>${n.publishedBy || 'Administration'}</strong></span>
            <button class="btn btn-outline btn-sm read-notice-btn" data-id="${n.id}">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="assets/icons/icons.svg#icon-eye"></use></svg>
              View Official Circular
            </button>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.read-notice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const notice = notices.find(x => x.id === id);
        if (notice) {
          document.getElementById('modal-notice-title').textContent = notice.title;
          document.getElementById('modal-notice-date').textContent = `${formatDate(notice.date)} • Category: ${notice.category}`;
          document.getElementById('modal-notice-body').textContent = notice.body;
          document.getElementById('modal-notice-issuer').textContent = notice.publishedBy || 'Principal Office';
          openModal('modal-view-notice');
        }
      });
    });
  }
}
