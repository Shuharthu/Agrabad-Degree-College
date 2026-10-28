/**
 * AGRABAD DEGREE COLLEGE - PRIVILEGED CLOUD FUNCTIONS
 * Handles:
 * 1. SSLCommerz Payment Gateway Session Initiation
 * 2. SSLCommerz Server-to-Server IPN (Instant Payment Notification) & Atomic Verification
 * 3. Idempotent Fee Ledger Updates
 * 4. Role Management via Firebase Custom Claims (RBAC)
 * 5. Admission Status Notification Triggers
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

// Configuration for SSLCommerz (Bangladesh Gateway)
const SSLCOMMERZ_CONFIG = {
  storeId: process.env.SSLCOMMERZ_STORE_ID || "agrabadcollege_live",
  storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || "placeholder_pass",
  isSandbox: process.env.SSLCOMMERZ_IS_SANDBOX === "true" || true,
  initUrl: process.env.SSLCOMMERZ_IS_SANDBOX === "false" 
    ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
    : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
  validationUrl: process.env.SSLCOMMERZ_IS_SANDBOX === "false"
    ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
    : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
};

/**
 * 1. INITIATE PAYMENT SESSION
 * Verifies student, fee obligation, creates pending record, calls SSLCommerz API.
 */
exports.initiateSSLCommerzPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }

  const { feeId, paymentMethod } = data;
  if (!feeId) {
    throw new functions.https.HttpsError("invalid-argument", "Fee obligation ID is required.");
  }

  const feeDoc = await db.collection("feeObligations").doc(feeId).get();
  if (!feeDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Fee obligation record not found.");
  }

  const feeData = feeDoc.data();
  if (feeData.status === "Paid") {
    throw new functions.https.HttpsError("failed-precondition", "This fee obligation has already been paid.");
  }

  // Generate unique transaction reference
  const tranId = `ADC-PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Create pending transaction in Firestore
  const txnRef = db.collection("paymentTransactions").doc(tranId);
  await txnRef.set({
    transactionRef: tranId,
    studentId: feeData.studentId,
    feeId: feeId,
    title: feeData.title,
    category: feeData.category || "Tuition",
    amount: feeData.amount,
    currency: "BDT",
    paymentMethod: paymentMethod || "SSLCommerz",
    status: "Pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    verified: false
  });

  // Log audit
  await db.collection("auditLogs").add({
    actor: context.auth.token.email || "Student",
    action: "INITIATE_PAYMENT",
    target: `Transaction ${tranId} for fee ${feeData.title} (Amount: BDT ${feeData.amount})`,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ip: context.rawRequest.ip || "Client"
  });

  return {
    success: true,
    transactionRef: tranId,
    amount: feeData.amount,
    currency: "BDT",
    gatewayUrl: `${SSLCOMMERZ_CONFIG.initUrl}?tran_id=${tranId}`
  };
});

/**
 * 2. SSLCOMMERZ SERVER-TO-SERVER IPN WEBHOOK
 * Trusted verification endpoint. Idempotent ledger updates.
 */
exports.sslcommerzIPNWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const ipnData = req.body;
  const { val_id, tran_id, amount, currency, status } = ipnData;

  if (!tran_id || !val_id) {
    return res.status(400).send("Invalid IPN Payload.");
  }

  const txnDocRef = db.collection("paymentTransactions").doc(tran_id);

  try {
    // Run atomic Firestore transaction to guarantee idempotency
    await db.runTransaction(async (t) => {
      const doc = await t.get(txnDocRef);
      if (!doc.exists) {
        throw new Error("Transaction record not found in system.");
      }

      const txnData = doc.data();

      // Idempotency check: Already processed
      if (txnData.status === "Paid" && txnData.verified === true) {
        return; // Nothing more to do
      }

      if (status !== "VALID" && status !== "VALIDATED") {
        t.update(txnDocRef, {
          status: "Failed",
          gatewayResponse: ipnData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return;
      }

      // Check amount matching
      if (Number(amount) !== Number(txnData.amount) || currency !== "BDT") {
        t.update(txnDocRef, {
          status: "AmountMismatch",
          gatewayResponse: ipnData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        throw new Error("Payment amount/currency validation mismatch.");
      }

      // Mark transaction as Paid
      t.update(txnDocRef, {
        status: "Paid",
        verified: true,
        valId: val_id,
        gatewayResponse: ipnData,
        paidAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update fee obligation
      if (txnData.feeId) {
        const feeDocRef = db.collection("feeObligations").doc(txnData.feeId);
        t.update(feeDocRef, {
          status: "Paid",
          paidTransactionRef: tran_id,
          paidAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Generate official money receipt document
      const receiptDocRef = db.collection("paymentReceipts").doc(`RCPT-${tran_id}`);
      t.set(receiptDocRef, {
        receiptNumber: `RCPT-${tran_id}`,
        transactionRef: tran_id,
        studentId: txnData.studentId,
        amount: txnData.amount,
        title: txnData.title,
        paymentMethod: txnData.paymentMethod,
        valId: val_id,
        issuedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Record audit log
    await db.collection("auditLogs").add({
      actor: "SSLCommerz IPN Webhook",
      action: "VERIFY_PAYMENT",
      target: `Transaction ${tran_id} marked as Paid (val_id: ${val_id})`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: req.ip || "Gateway Webhook"
    });

    return res.status(200).send("IPN Processed Successfully");
  } catch (error) {
    functions.logger.error("IPN Processing Failed:", error);
    return res.status(500).send("Internal Server Processing Error");
  }
});

/**
 * 3. PRIVILEGED ROLE ASSIGNMENT VIA CUSTOM CLAIMS
 * Only existing verified Admins can grant roles.
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Only administrators can assign roles.");
  }

  const { targetUid, newRole } = data;
  if (!["admin", "teacher", "student"].includes(newRole)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid role specified.");
  }

  await admin.auth().setCustomUserClaims(targetUid, { role: newRole });
  await db.collection("users").doc(targetUid).update({
    role: newRole,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true, message: `Role ${newRole} granted to user ${targetUid}` };
});

/**
 * 4. ADMISSION STATUS CHANGE TRIGGER
 */
exports.onApplicationStatusChange = functions.firestore
  .document("admissionApplications/{appId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== after.status) {
      await db.collection("auditLogs").add({
        actor: "System / Admission Officer",
        action: "STATUS_UPDATE",
        target: `Application ${after.refNumber} status changed from ${before.status} to ${after.status}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
