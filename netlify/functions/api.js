const express = require('express');
const serverless = require('serverless-http');
const admin = require('firebase-admin');

// CHANGE THIS PATH TO YOUR ACTUAL FILE NAME
const serviceAccount = require('../../firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com/"  // ← CHANGE THIS
});

const db = admin.database();
const app = express();
app.use(express.json());

// Get current LED states
app.get('/api/states', async (req, res) => {
  try {
    const snapshot = await db.ref('/').once('value');
    const data = snapshot.val();
    res.json(data || { led1: false, led2: false });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Toggle LED
app.post('/api/toggle/:led', async (req, res) => {
  const led = req.params.led;
  if (!['led1', 'led2'].includes(led)) {
    return res.status(400).json({ error: 'Invalid LED' });
  }
  try {
    const ref = db.ref(led);
    const snapshot = await ref.once('value');
    const current = snapshot.val() || false;
    await ref.set(!current);
    res.json({ [led]: !current });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports.handler = serverless(app);