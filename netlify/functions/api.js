 const express = require('express');
const serverless = require('serverless-http');
const admin = require('firebase-admin');

// ────────────────────── SAFE FIREBASE INITIALISATION ──────────────────────
let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Netlify → use the secret you added
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Local testing only
    serviceAccount = require('../../firebase-key.json');
  }

  // Only initialise once
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://home-automation-1f910-default-rtdb.firebaseio.com"
    });
  }
} catch (error) {
  console.error("Firebase init error:", error.message);
}

const db = admin.database();
const app = express();
app.use(express.json());