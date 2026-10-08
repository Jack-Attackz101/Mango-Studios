// Relays a form submission to Resend.
//
// The API key lives in the RESEND_API_KEY environment variable on Vercel, never
// in the page: anything the browser can read, any visitor can read and use to
// send mail from this account. Resend also refuses cross-origin browser calls,
// so the request has to be made from here.

const TO = 'jackkollgunderson@gmail.com';
const FROM = process.env.RESEND_FROM || 'Mango Studios <onboarding@resend.dev>';
const MAX_FIELDS = 40;
const MAX_LEN = 4000;

function clean(value) {
  return String(value == null ? '' : value).slice(0, MAX_LEN).replace(/[\r\n]+/g, ' ').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // No key configured yet: say so plainly and give them a way through that works.
    return res.status(503).json({
      error: 'We cannot take messages here just yet.',
      fallback: true,
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (err) { body = null; }
  }
  const form = clean(body && body.form).slice(0, 120);
  const fields = body && Array.isArray(body.fields) ? body.fields.slice(0, MAX_FIELDS) : null;
  if (!form || !fields || !fields.length) {
    return res.status(400).json({ error: 'That form did not come through. Please try again.' });
  }

  // Every field goes in, in the order it appears on the form, blank ones included.
  const lines = fields.map(function (field) {
    return clean(field && field.label) + ': ' + clean(field && field.value);
  });

  const replyTo = fields
    .map(function (f) { return clean(f && f.value); })
    .find(function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); });

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: form,
        text: lines.join('\n'),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
  } catch (err) {
    return res.status(502).json({ error: 'We could not send that just now. Please try again.' });
  }

  if (!response.ok) {
    const detail = await response.text().catch(function () { return ''; });
    console.error('Resend rejected the send:', response.status, detail);
    return res.status(502).json({ error: 'We could not send that just now. Please try again.' });
  }

  return res.status(200).json({ ok: true });
}
