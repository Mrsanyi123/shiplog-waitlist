const admin = require('firebase-admin');

function getFirestore() {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
    }
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(raw)),
    });
  }
  return admin.firestore();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  const normalized = typeof email === 'string' ? email.toLowerCase().trim() : '';

  if (!normalized || !normalized.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    const db = getFirestore();
    const ref = db.collection('waitlist').doc(normalized);
    const existing = await ref.get();

    if (existing.exists) {
      return res.status(200).json({ message: "You're already on the waitlist!" });
    }

    await ref.set({
      email: normalized,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      message: "You're on the waitlist!",
    });
  } catch (err) {
    console.error('waitlist error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
