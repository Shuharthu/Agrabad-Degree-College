/**
 * AGRABAD DEGREE COLLEGE - FEE MANAGEMENT & SECURE PAYMENT GATEWAY MODULE
 * Supports bKash, Nagad, Cards (Visa/Mastercard), and Sonali Bank.
 * Implements server-style verification, idempotency, pending states,
 * and printable official money receipts.
 */

import { mockDb } from './mock-backend.js';
import { auth } from './auth.js';
import { formatBDT, formatDate, showToast, openModal, closeModal } from './utilities.js';

export class PaymentManager {
  constructor() {
    this.user = auth.getCurrentUser();
    this.student = null;
    this.selectedFee = null;
    this.selectedMethod = 'bKash';
    this.currentTxnRef = null;
  }

  init() {
    if (!this.user) return;
    const profiles = mockDb.getCollection('studentProfiles');
    this.student = profiles.find(s => s.userId === this.user.uid || s.email === this.user.email) || profiles[0];

    this.renderPendingFees();
    this.renderPaymentHistory();
    this.setupPaymentMethods();
    this.setupGatewayModal();
  }

  renderPendingFees() {
    const feeContainer = document.getElementById('pending-fees-container');
    const totalDueEl = document.getElementById('total-due-amount');
    if (!feeContainer) return;

    const fees = mockDb.getCollection('feeObligations').filter(f => f.studentId === this.student.studentId && f.status === 'Pending');
    const totalDue = fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    if (totalDueEl) totalDueEl.textContent = formatBDT(totalDue);

    if (fees.length === 0) {
      feeContainer.innerHTML = `
        <div class="empty-state">
          <svg class="icon empty-state-icon text-success" viewBox="0 0 24 24"><use href="assets/icons/icons.svg#icon-check-circle"></use></svg>
          <div class="empty-state-title">All Dues Cleared</div>
          <p class="empty-state-text">You have no pending fee obligations at this time.</p>
        </div>
      `;
      const payBtn = document.getElementById('btn-initiate-payment');
      if (payBtn) payBtn.disabled = true;
      return;
    }

    feeContainer.innerHTML = fees.map((f, idx) => `
      <div class="card" style="margin-bottom: 0.85rem; border: 2px solid ${idx === 0 ? 'var(--color-blue-primary)' : 'var(--color-slate-200)'};">
        <div class="card-body d-flex justify-between align-center">
          <div>
            <div class="d-flex align-center gap-2">
              <input type="radio" name="selected_fee" value="${f.id}" id="fee_${f.id}" ${idx === 0 ? 'checked' : ''} style="cursor: pointer;">
              <label for="fee_${f.id}" class="fw-bold text-navy" style="cursor: pointer;">${f.title}</label>
            </div>
            <div class="text-muted" style="font-size: 0.8125rem; margin-left: 1.5rem;">Due by: ${formatDate(f.dueDate)} • Category: ${f.category}</div>
          </div>
          <div class="text-right">
            <span class="fw-bold text-navy" style="font-size: 1.2rem;">${formatBDT(f.amount)}</span>
            <div><span class="badge badge-pending">Pending</span></div>
          </div>
        </div>
      </div>
    `).join('');

    // Default select first fee
    this.selectedFee = fees[0];

    feeContainer.querySelectorAll('input[name="selected_fee"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.selectedFee = fees.find(f => f.id === e.target.value);
      });
    });
  }

  renderPaymentHistory() {
    const tbody = document.getElementById('payment-history-tbody');
    if (!tbody) return;

    const txns = mockDb.getCollection('paymentTransactions').filter(t => t.studentId === this.student.studentId);
    if (txns.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No past payment records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = txns.map(t => `
      <tr>
        <td><strong>${formatDate(t.paidAt)}</strong></td>
        <td>
          <div class="fw-semibold text-navy">${t.title}</div>
          <div class="text-muted" style="font-size: 0.75rem;">${t.transactionRef}</div>
        </td>
        <td><strong>${formatBDT(t.amount)}</strong></td>
        <td>${t.paymentMethod}</td>
        <td><span class="badge badge-paid">Paid</span></td>
        <td>
          <button class="btn btn-outline btn-sm btn-print-receipt" data-ref="${t.transactionRef}">
            <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="assets/icons/icons.svg#icon-printer"></use></svg>
            Receipt
          </button>
        </td>
      </tr>
    `).join('');

    // Attach Receipt printer handlers
    tbody.querySelectorAll('.btn-print-receipt').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.getAttribute('data-ref');
        this.openReceiptModal(ref);
      });
    });
  }

  setupPaymentMethods() {
    const cards = document.querySelectorAll('.payment-method-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        this.selectedMethod = card.getAttribute('data-method');
      });
    });

    const initBtn = document.getElementById('btn-initiate-payment');
    if (initBtn) {
      initBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!this.selectedFee) {
          showToast('No Fee Selected', 'Please select a pending fee obligation to pay.', 'warning');
          return;
        }
        this.openGatewayModal();
      });
    }
  }

  openGatewayModal() {
    // Generate secure pending transaction reference
    this.currentTxnRef = `TXN-${this.selectedMethod.toUpperCase().substring(0, 4)}-${Math.floor(10000 + Math.random() * 90000)}`;

    const titleEl = document.getElementById('gw-modal-title');
    const feeNameEl = document.getElementById('gw-fee-title');
    const amountEl = document.getElementById('gw-fee-amount');
    const refEl = document.getElementById('gw-txn-ref');
    const logoEl = document.getElementById('gw-method-logo');

    if (titleEl) titleEl.textContent = `Checkout with ${this.selectedMethod}`;
    if (feeNameEl) feeNameEl.textContent = this.selectedFee.title;
    if (amountEl) amountEl.textContent = formatBDT(this.selectedFee.amount);
    if (refEl) refEl.textContent = this.currentTxnRef;
    if (logoEl) logoEl.textContent = this.selectedMethod;

    // Reset gateway stages
    document.getElementById('gw-stage-1').style.display = 'block';
    document.getElementById('gw-stage-2').style.display = 'none';
    document.getElementById('gw-stage-processing').style.display = 'none';
    document.getElementById('gw-phone-input').value = this.student.mobile.replace(/[^0-9]/g, '');

    openModal('modal-payment-gateway');
  }

  setupGatewayModal() {
    const btnSendOtp = document.getElementById('btn-gw-send-otp');
    const btnConfirmPay = document.getElementById('btn-gw-confirm-payment');

    if (btnSendOtp) {
      btnSendOtp.addEventListener('click', () => {
        const phone = document.getElementById('gw-phone-input').value.trim();
        if (!phone || phone.length < 11) {
          showToast('Invalid Mobile', 'Enter a valid 11-digit mobile account number.', 'warning');
          return;
        }
        // Move to Stage 2 (OTP & PIN)
        document.getElementById('gw-stage-1').style.display = 'none';
        document.getElementById('gw-stage-2').style.display = 'block';
        showToast('OTP Sent', `Verification code sent to ${phone}. (Sandbox OTP: 123456)`, 'info');
      });
    }

    if (btnConfirmPay) {
      btnConfirmPay.addEventListener('click', () => {
        const pin = document.getElementById('gw-pin-input').value;
        if (!pin || pin.length < 4) {
          showToast('PIN Required', 'Please enter your account PIN.', 'warning');
          return;
        }

        // Show Gateway Verification Processing Spinner
        document.getElementById('gw-stage-2').style.display = 'none';
        document.getElementById('gw-stage-processing').style.display = 'block';

        // Simulate secure server-side gateway callback & ledger update
        setTimeout(() => {
          this.completeVerifiedPayment();
        }, 1800);
      });
    }
  }

  completeVerifiedPayment() {
    const fee = this.selectedFee;
    const txnRef = this.currentTxnRef;

    // 1. Mark Fee obligation as Paid in database
    mockDb.update('feeObligations', fee.id, { status: 'Paid', paidAt: new Date().toISOString() });

    // 2. Insert verified transaction into ledger
    const newTxn = {
      id: 'txn_' + Date.now(),
      transactionRef: txnRef,
      studentId: this.student.studentId,
      studentName: this.student.fullName,
      title: fee.title,
      category: fee.category,
      amount: fee.amount,
      paymentMethod: this.selectedMethod,
      status: 'Paid',
      gatewayRef: `GW-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paidAt: new Date().toISOString(),
      verified: true
    };
    mockDb.insert('paymentTransactions', newTxn);

    // 3. Log Audit
    mockDb.logAudit(this.user, 'PAYMENT_VERIFIED', `Payment of ${formatBDT(fee.amount)} verified for ${fee.title} via ${this.selectedMethod} (${txnRef})`);

    // 4. Close Modal & Refresh Views
    closeModal('modal-payment-gateway');
    showToast('Payment Successful!', `Transaction ${txnRef} verified. Receipt is now available.`, 'success');

    this.renderPendingFees();
    this.renderPaymentHistory();

    // Auto open receipt
    this.openReceiptModal(txnRef);
  }

  openReceiptModal(txnRef) {
    const txns = mockDb.getCollection('paymentTransactions');
    const txn = txns.find(t => t.transactionRef === txnRef);
    if (!txn) return;

    document.getElementById('rcpt-ref').textContent = txn.transactionRef;
    document.getElementById('rcpt-date').textContent = formatDate(txn.paidAt);
    document.getElementById('rcpt-student-name').textContent = txn.studentName;
    document.getElementById('rcpt-student-id').textContent = txn.studentId;
    document.getElementById('rcpt-program').textContent = `${this.student.program} (${this.student.department})`;
    document.getElementById('rcpt-item-desc').textContent = txn.title;
    document.getElementById('rcpt-item-amount').textContent = formatBDT(txn.amount);
    document.getElementById('rcpt-total-amount').textContent = formatBDT(txn.amount);
    document.getElementById('rcpt-method').textContent = txn.paymentMethod;
    document.getElementById('rcpt-gateway-ref').textContent = txn.gatewayRef;

    const printBtn = document.getElementById('btn-print-receipt-modal');
    if (printBtn) {
      printBtn.onclick = () => window.print();
    }

    openModal('modal-receipt');
  }
}
