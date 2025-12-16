const express = require('express');
const serverless = require('serverless-http');
const admin = require('firebase-admin');

const LED_KEYS = ['led1', 'led2'];
let db;
let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Local testing only - ensure firebase-key.json exists when developing locally
    serviceAccount = require('../../firebase-key.json');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://home-automation-1f910-default-rtdb.firebaseio.com',
    });
  }

  db = admin.database();
} catch (error) {
  console.error('Firebase init error:', error.message);
}

const normaliseStates = (payload = {}) => ({
  led1: !!payload.led1,
  led2: !!payload.led2,
});

const ensureDb = () => {
  if (!db) {
    throw new Error('Firebase not initialised; check credentials.');
  }
  return db;
};

const readStates = async () => {
  const dbInstance = ensureDb();
  const primarySnapshot = await dbInstance.ref('leds').once('value');

  // Fallback to root-level values if legacy data exists there
  const raw = primarySnapshot.exists()
    ? primarySnapshot.val()
    : (await dbInstance.ref('/').once('value')).val();

  const states = normaliseStates(raw || {});

  if (!primarySnapshot.exists()) {
    await dbInstance.ref('leds').set(states);
  }

  return states;
};

const writeStates = async (states) => {
  const next = normaliseStates(states);
  const dbInstance = ensureDb();

  await Promise.all([
    dbInstance.ref('leds').set(next), // structured path for newer clients
    dbInstance.ref('led1').set(next.led1), // root-level keys for legacy listeners
    dbInstance.ref('led2').set(next.led2),
  ]);

  return next;
};

const app = express();
app.use(express.json());

const router = express.Router();

router.get('/states', async (_req, res) => {
  try {
    const states = await readStates();
    res.json(states);
  } catch (error) {
    console.error('State fetch failed', error);
    res.status(500).json({ error: 'Unable to read device state' });
  }
});

router.post('/toggle/:led', async (req, res) => {
  const { led } = req.params;

  if (![...LED_KEYS, 'all', 'both'].includes(led)) {
    return res.status(400).json({ error: 'Unknown device' });
  }

  try {
    const current = await readStates();
    let nextState;

    if (led === 'all' || led === 'both') {
      nextState = normaliseStates({
        led1: !current.led1,
        led2: !current.led2,
      });
    } else {
      nextState = normaliseStates({
        ...current,
        [led]: !current[led],
      });
    }

    const saved = await writeStates(nextState);
    res.json(saved);
  } catch (error) {
    console.error('Toggle failed', error);
    res.status(500).json({ error: 'Unable to toggle device' });
  }
});

router.post('/set/:led', async (req, res) => {
  const { led } = req.params;
  const { state } = req.body || {};

  if (!LED_KEYS.includes(led)) {
    return res.status(400).json({ error: 'Unknown device' });
  }

  if (typeof state !== 'boolean') {
    return res.status(400).json({ error: 'State must be a boolean' });
  }

  try {
    const current = await readStates();
    const saved = await writeStates({ ...current, [led]: state });
    res.json(saved);
  } catch (error) {
    console.error('Set failed', error);
    res.status(500).json({ error: 'Unable to update device' });
  }
});

// Support both Netlify function path and local dev path
app.use('/.netlify/functions/api', router);
app.use('/', router);

module.exports.handler = serverless(app);
