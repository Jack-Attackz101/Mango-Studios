// Password gate for the outreach dashboard.
//
// OUTREACH_PASSWORD is the shared password. OUTREACH_DATA_B64 is the base64
// of the JSON from scripts/build-outreach-data.py. Neither value belongs in
// the repo: this project is public and deploys on Vercel Hobby.

const crypto = require('crypto');

const DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Hash both sides so timingSafeEqual always compares equal-length digests.
// An empty configured password never matches, including an empty submission.
function passwordsMatch(provided, expected) {
  const actual = crypto.createHash('sha256').update(String(provided ?? ''), 'utf8').digest();
  const want = crypto.createHash('sha256').update(String(expected ?? ''), 'utf8').digest();
  return crypto.timingSafeEqual(actual, want) && typeof expected === 'string' && expected.length > 0;
}

function providedPassword(body) {
  if (Buffer.isBuffer(body)) body = body.toString('utf8');
  if (typeof body === 'string') {
    if (!body.trim()) return undefined;
    try {
      body = JSON.parse(body);
    } catch (err) {
      return undefined;
    }
  }
  if (!body || typeof body !== 'object') return undefined;
  return body.password;
}

function send(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(payload);
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return send(res, 405, { error: 'Method not allowed.' });
    }

    if (!passwordsMatch(providedPassword(req.body), process.env.OUTREACH_PASSWORD)) {
      await sleep(DELAY_MS);
      return send(res, 401, { error: 'Wrong password.' });
    }

    const encoded = process.env.OUTREACH_DATA_B64;
    if (!encoded) {
      console.error('OUTREACH_DATA_B64 is not set');
      return send(res, 500, { error: 'Outreach data is not available.' });
    }

    let data;
    try {
      data = JSON.parse(Buffer.from(encoded, 'base64').toString());
    } catch (err) {
      console.error('OUTREACH_DATA_B64 could not be decoded');
      return send(res, 500, { error: 'Outreach data is not available.' });
    }

    return send(res, 200, data);
  } catch (err) {
    console.error('outreach api failed');
    return send(res, 500, { error: 'Outreach data is not available.' });
  }
};
