// Firebase Admin SDK initialization using modular API (firebase-admin v14+)
const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getMessaging } = require('firebase-admin/messaging');

let auth = null;
let messaging = null;

try {
  let serviceAccount = null;

  // 1. Support inline JSON string (useful for deployment environments)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT_JSON === 'string'
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  }
  // 2. Support file path to service account key JSON file
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const resolvedPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (fs.existsSync(resolvedPath)) {
      serviceAccount = require(resolvedPath);
    } else {
      console.warn(`Firebase warning: Service account file not found at ${resolvedPath}`);
    }
  }

  // Guard against double initialization using getApps()
  if (serviceAccount && getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase initialized');
  }

  // Export getAuth() and getMessaging() results if an app is initialized
  if (getApps().length > 0) {
    auth = getAuth();
    messaging = getMessaging();
  } else {
    console.warn('Firebase warning: No credentials configured (FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON).');
  }
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

module.exports = {
  auth,
  messaging
};
