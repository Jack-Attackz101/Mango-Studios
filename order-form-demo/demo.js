/* Mango Studios automation demo.
   Talks to the Apps Script backend with a simple text/plain POST (no preflight).
   Customer data is rendered with textContent only. No real email is sent. */

const API_URL = 'https://script.google.com/macros/s/AKfycbxSmx-HFvCEib96XhHwjL0rtInTLgtMZjh1noUMIoB-lOTLLwwLFaB_BE203HJXINzB/exec';
const UNREACHABLE = "Couldn't reach the demo. Please try again.";
const SESSION_KEY = 'mango_demo_session';
const LINK_RE = /https:\/\/mangostudios\.xyz\/order-form-demo#[A-Za-z0-9_=.\-]+/g;

const STEP_LABEL = {
  followup_1: 'Day 1 follow-up',
  followup_2: 'Day 3 follow-up',
  reminder_24h_v1: 'Reminder, 24 hours before',
  reminder_1h_v1: 'Reminder, 1 hour before',
  review_nudge: 'Day 3 rating nudge'
};

const state = {
  session: '',
  config: null,
  emails: [],
  scheduled: [],
  inboxFilter: 'all',
  ready: false,
  paused: false
};

const TITLES = {
  showcase: 'Automations that run themselves',
  order: 'Demo Bakery pre-orders',
  leads: 'Contact Demo Landscaping Co.',
  book: 'Book at Demo Hair Studio',
  reviews: 'Mark a job done',
  manage: 'Your booking',
  rate: 'How did we do?',
  public: 'Public review page',
  inbox: 'Inbox',
  invalid: 'This link isn\'t valid'
};

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
}

function sleep(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function heading(text) {
  const h = el('h1', null, text);
  h.tabIndex = -1;
  return h;
}

function ensureSession() {
  let session = '';
  try { session = localStorage.getItem(SESSION_KEY) || ''; } catch (err) { session = ''; }
  if (!/^s-[A-Za-z0-9_-]{16,62}$/.test(session)) {
    session = 's-' + uuid();
    try { localStorage.setItem(SESSION_KEY, session); } catch (err) { /* memory only */ }
  }
  state.session = session;
}

async function api(payload, attempt) {
  const tries = attempt || 0;
  const body = JSON.stringify(Object.assign({ session: state.session }, payload));
  if (body.length > 10000) {
    return { ok: false, error: { code: 'too_large', message: 'That is too large to send (over 10,000 characters).' } };
  }
  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body,
      redirect: 'follow'
    });
  } catch (err) {
    if (tries < 1) {
      await sleep(2000);
      return api(payload, tries + 1);
    }
    return { ok: false, error: { code: 'network', message: UNREACHABLE } };
  }
  let json;
  try {
    json = await response.json();
  } catch (err) {
    if (tries < 1) {
      await sleep(2000);
      return api(payload, tries + 1);
    }
    return { ok: false, error: { code: 'network', message: UNREACHABLE } };
  }
  if (json && json.ok === false && json.error && json.error.code === 'busy') {
    if (tries < 1) {
      await sleep(2000);
      return api(payload, tries + 1);
    }
    return { ok: false, action: json.action, error: { code: 'busy', message: UNREACHABLE } };
  }
  return json;
}

function messageFor(res) {
  if (!res || !res.error) return UNREACHABLE;
  const code = res.error.code;
  if (code === 'not_found') return "This link isn't valid.";
  if (code === 'network' || code === 'busy') return UNREACHABLE;
  if (code === 'disabled') return 'The demo is paused';
  if (code === 'conflict') {
    const msg = res.error.message || '';
    const slotTaken = res.error.fields && res.error.fields.slot;
    if (slotTaken && msg.indexOf('Sorry, that time was just taken') === -1) {
      return msg ? 'Sorry, that time was just taken. ' + msg : 'Sorry, that time was just taken.';
    }
    return msg || 'Sorry, that time was just taken.';
  }
  return res.error.message || 'Something went wrong.';
}

function showPaused() {
  state.paused = true;
  const app = document.getElementById('app');
  clear(app);
  const h = heading('The demo is paused');
  app.append(h, el('p', null, 'The demo is paused. Nothing can be submitted right now.'));
  h.focus();
}

function absorbInbox(res) {
  const stored = res.data && Array.isArray(res.data.emails) ? res.data.emails : [];
  const released = Array.isArray(res.emails) ? res.emails : [];
  const seen = new Set();
  const next = [];
  released.slice().reverse().concat(stored).forEach((email) => {
    if (!email || !email.id || seen.has(email.id)) return;
    seen.add(email.id);
    next.push(email);
  });
  state.emails = next;
  state.scheduled = res.data && Array.isArray(res.data.scheduled) ? res.data.scheduled : [];
}

function addEmails(list) {
  if (!Array.isArray(list) || !list.length) return;
  const seen = new Set(state.emails.map((email) => email && email.id));
  const front = [];
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const email = list[i];
    if (!email || !email.id || seen.has(email.id)) continue;
    seen.add(email.id);
    front.push(email);
  }
  if (front.length) state.emails = front.concat(state.emails);
  updateBadge();
}

function updateBadge() {
  const n = state.emails.length;
  const badge = document.getElementById('inbox-count');
  const link = document.getElementById('nav-inbox');
  if (badge) badge.textContent = String(n);
  if (link) {
    link.setAttribute('aria-label', 'Inbox, ' + n + (n === 1 ? ' simulated email' : ' simulated emails'));
  }
}

async function refreshInboxQuiet() {
  const res = await api({ action: 'inbox' });
  if (!res || res.ok !== true) {
    if (res && res.error && res.error.code === 'disabled') showPaused();
    return;
  }
  absorbInbox(res);
  updateBadge();
  if (document.getElementById('inbox-emails')) paintInbox();
}

function demoBusiness(demo) {
  const map = (state.config && state.config.businesses) || {};
  return map[demo] || '';
}

function dueLabel(refId, step, fallback) {
  const hit = state.scheduled.find((item) => item && item.ref_id === refId && item.step === step && item.due_label);
  return (hit && hit.due_label) || fallback || '';
}

function linkify(pre, body) {
  const text = String(body || '');
  const re = new RegExp(LINK_RE.source, 'g');
  let last = 0;
  let match;
  while ((match = re.exec(text))) {
    pre.appendChild(document.createTextNode(text.slice(last, match.index)));
    const href = match[0];
    const hash = href.slice(href.indexOf('#'));
    const a = document.createElement('a');
    a.href = hash;
    a.textContent = href;
    pre.appendChild(a);
    last = match.index + href.length;
  }
  pre.appendChild(document.createTextNode(text.slice(last)));
}

function emailCard(email) {
  const art = el('article', 'email');
  const who = email.business || demoBusiness(email.demo) || email.demo || 'Email';
  art.append(el('p', 'email-kicker', who + (email.status ? ' · ' + email.status : '')));
  art.append(el('h3', null, email.subject || '(no subject)'));
  const meta = 'To ' + (email.to || '') + (email.from ? ' · From ' + email.from : '');
  art.append(el('p', 'muted', meta));
  const pre = el('pre', 'email-body');
  linkify(pre, email.body || '');
  art.append(pre);
  return art;
}

function scheduledCard(item) {
  const art = el('article', 'email');
  const who = demoBusiness(item.demo) || item.demo || 'Scheduled';
  art.append(el('p', 'email-kicker', who + ' · ' + (item.status || 'scheduled')));
  art.append(el('h3', null, item.subject || STEP_LABEL[item.step] || item.step || 'Scheduled email'));
  const bits = [];
  if (item.due_label) bits.push(item.due_label);
  else if (item.due_at) bits.push(String(item.due_at));
  if (item.to) bits.push('To ' + item.to);
  if (item.step) bits.push(STEP_LABEL[item.step] || item.step);
  art.append(el('p', 'muted', bits.join(' · ')));
  if (item.note) art.append(el('p', null, String(item.note)));
  return art;
}

function showFieldErrors(scope, fields) {
  scope.querySelectorAll('[data-error]').forEach((node) => { node.textContent = ''; });
  scope.querySelectorAll('[aria-invalid]').forEach((node) => { node.removeAttribute('aria-invalid'); });
  if (!fields || typeof fields !== 'object') return;
  scope.querySelectorAll('[data-error]').forEach((node) => {
    const key = node.getAttribute('data-error');
    if (!Object.prototype.hasOwnProperty.call(fields, key) || !fields[key]) return;
    node.textContent = String(fields[key]);
    const field = node.closest('[data-field]');
    const control = field && field.querySelector('input, select, textarea');
    if (control) control.setAttribute('aria-invalid', 'true');
  });
}

function showBanner(scope, message) {
  const banner = scope.querySelector('[data-banner]');
  if (!banner) return;
  banner.textContent = message || '';
}

function clearSuccess(scope) {
  const box = scope.querySelector('[data-success]');
  if (box) clear(box);
}

function showSuccess(scope, res) {
  const box = scope.querySelector('[data-success]');
  if (!box) return;
  clear(box);
  const data = res.data || {};
  let lead = 'Done. The emails below were prepared for this demo, and none of them were sent.';
  if (data.duplicate) lead = 'Already received, so nothing new was created. These are the original emails. None were sent.';
  if (data.unchanged) lead = 'That booking is already at this time. No new email was created.';
  if (data.already && res.action === 'booking.cancel') lead = 'This booking was already cancelled.';
  if (data.already && res.action === 'review.rate') lead = 'This review was already rated.';
  box.append(el('p', null, lead));
  if (data.outcome === 'private_owner_alert') {
    box.append(el('p', null, "Thanks for telling us. We've passed this to the owner privately."));
  }
  if (data.outcome === 'thank_you_public_link') {
    const line = el('p');
    line.append(document.createTextNode('Thank you. '));
    const a = document.createElement('a');
    a.href = '#public-review';
    a.textContent = 'Public review page';
    line.append(a);
    line.append(document.createTextNode(' — a live setup would link to the business\'s real page. Nothing is posted from here.'));
    box.append(line);
  }
  (res.emails || []).forEach((email) => box.append(emailCard(email)));
}

function noteFailure(res, form) {
  if (!res || !res.error || !form) return;
  const code = res.error.code;
  if (code === 'validation' || code === 'conflict') {
    form.dataset.rotate = '1';
    showFieldErrors(form, res.error.fields || {});
  }
  if (code === 'bad_request') {
    form.reset();
    form.dataset.idem = uuid();
    form.dataset.rotate = '0';
  }
}

function field(id, label, control, errorKey) {
  const wrap = el('div', 'field');
  wrap.setAttribute('data-field', errorKey || id);
  const lab = el('label', null, label);
  lab.htmlFor = id;
  control.id = id;
  const err = el('p', 'field-error');
  err.setAttribute('data-error', errorKey || control.name || id);
  err.id = id + '-error';
  control.setAttribute('aria-describedby', err.id);
  wrap.append(lab, control, err);
  return wrap;
}

function honeypot(id) {
  const wrap = el('div', 'hp');
  wrap.setAttribute('aria-hidden', 'true');
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'website';
  input.id = id;
  input.tabIndex = -1;
  input.autocomplete = 'off';
  const lab = el('label', null, 'Website');
  lab.htmlFor = id;
  wrap.append(lab, input);
  return wrap;
}

function websiteValue(form) {
  const input = form.querySelector('input[name="website"]');
  return input ? input.value : '';
}

function formValue(form, name) {
  const node = form.elements.namedItem(name);
  if (!node) return '';
  return String(node.value || '').trim();
}

function readQty(input) {
  const raw = String(input.value).trim();
  if (raw === '') return 0;
  if (!/^\d+$/.test(raw)) return raw;
  return Number(raw);
}

function bannerEl() {
  const p = el('p', 'banner');
  p.setAttribute('data-banner', '');
  p.setAttribute('role', 'alert');
  return p;
}

function successEl() {
  const box = el('div', 'success');
  box.setAttribute('data-success', '');
  box.setAttribute('role', 'status');
  box.setAttribute('aria-live', 'polite');
  return box;
}

function setBusy(btn, busy) {
  if (!btn) return;
  if (busy) {
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.textContent = 'Working…';
    btn.disabled = true;
    return;
  }
  if (btn.dataset.label) btn.textContent = btn.dataset.label;
  btn.disabled = false;
}

function wireForm(form, handlers) {
  form.dataset.idem = uuid();
  form.dataset.rotate = '0';
  form.noValidate = true;
  const rotate = () => {
    if (form.dataset.rotate === '1') {
      form.dataset.idem = uuid();
      form.dataset.rotate = '0';
    }
  };
  form.addEventListener('input', rotate);
  form.addEventListener('change', rotate);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (state.paused || form.dataset.busy === '1') return;
    const btn = form.querySelector('[type="submit"]');
    form.dataset.busy = '1';
    setBusy(btn, true);
    showBanner(form, '');
    showFieldErrors(form, {});
    clearSuccess(form);
    let res;
    try {
      res = await handlers.submit(form.dataset.idem);
    } catch (err) {
      res = { ok: false, error: { code: 'network', message: UNREACHABLE } };
    }
    form.dataset.busy = '0';
    if (!res || res.ok !== true) {
      if (res && res.error && res.error.code === 'disabled') {
        showPaused();
        return;
      }
      noteFailure(res, form);
      showBanner(form, messageFor(res));
      if (res && res.error && res.error.code === 'conflict' && handlers.onConflict) {
        await handlers.onConflict(form);
      }
      setBusy(btn, false);
      if (res && res.error && res.error.code === 'rate_limited' && btn) btn.disabled = true;
      return;
    }
    addEmails(res.emails);
    form.dataset.idem = uuid();
    form.dataset.rotate = '0';
    showSuccess(form, res);
    setBusy(btn, false);
    if (handlers.after) await handlers.after(res);
    refreshInboxQuiet();
  });
}

function safeToken(token) {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{8,128}$/.test(token) ? token : '';
}

function parseHash() {
  let raw = location.hash.replace(/^#/, '');
  try { raw = decodeURIComponent(raw); } catch (err) { raw = ''; }
  if (raw === '' || raw === 'showcase') return { view: 'showcase' };
  if (raw === 'order' || raw === 'leads' || raw === 'book' || raw === 'reviews' || raw === 'inbox') {
    return { view: raw };
  }
  if (raw === 'public-review') return { view: 'public' };
  const manage = raw.match(/^manage=([A-Za-z0-9_-]{8,128})$/);
  if (manage) return { view: 'manage', token: manage[1] };
  const rate = raw.match(/^rate=([A-Za-z0-9_-]{8,128})$/);
  if (rate) return { view: 'rate', token: rate[1] };
  if (raw.indexOf('manage=') === 0 || raw.indexOf('rate=') === 0) return { view: 'invalid' };
  return { view: 'showcase' };
}

function setCurrent(view) {
  const showcase = document.getElementById('nav-showcase');
  const inbox = document.getElementById('nav-inbox');
  if (view === 'showcase') showcase.setAttribute('aria-current', 'page');
  else showcase.removeAttribute('aria-current');
  if (view === 'inbox') inbox.setAttribute('aria-current', 'page');
  else inbox.removeAttribute('aria-current');
}

function render() {
  if (state.paused) {
    showPaused();
    return;
  }
  const route = parseHash();
  setCurrent(route.view);
  document.title = (TITLES[route.view] || TITLES.showcase) + ' · Mango Studios';
  const app = document.getElementById('app');
  clear(app);
  const view = VIEWS[route.view] || VIEWS.showcase;
  app.append(view(route));
  const h = app.querySelector('h1');
  if (h) h.focus();
}

function torontoToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function plusDays(iso, days) {
  const parts = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + days));
  return dt.toISOString().slice(0, 10);
}

function sortedByCreated(list) {
  return list.slice().sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
}

function itemsText(items) {
  if (typeof items === 'string') return items;
  if (!items || typeof items !== 'object') return '';
  return Object.keys(items).map((key) => String(items[key]) + ' × ' + key).join(', ');
}

function followList(rows, refId) {
  const ul = el('ul', 'mini');
  (rows || []).forEach((row) => {
    const due = dueLabel(refId, row.step, row.due_label || row.due_at || '');
    const label = STEP_LABEL[row.step] || row.step || 'Step';
    ul.append(el('li', null, [label, row.status, due].filter(Boolean).join(' · ')));
  });
  return ul;
}

function emptyNote(text) {
  return el('p', 'muted', text);
}

async function fillRecords(body, action, key, paint) {
  const res = await api({ action: action });
  if (!body.isConnected) return;
  clear(body);
  if (!res || res.ok !== true) {
    if (res && res.error && res.error.code === 'disabled') { showPaused(); return; }
    body.append(el('p', 'banner', messageFor(res)));
    return;
  }
  const rows = (res.data && res.data[key]) || [];
  if (!rows.length) {
    body.append(emptyNote('Nothing for this visit yet.'));
    return;
  }
  sortedByCreated(rows).forEach((row) => body.append(paint(row)));
}

function orderCard(order) {
  const art = el('article', 'record');
  art.append(el('h3', null, order.order_id || 'Order'));
  const bits = [order.name, order.pickup_date ? 'Pickup ' + order.pickup_date : ''].filter(Boolean);
  art.append(el('p', null, bits.join(' · ')));
  if (order.items) art.append(el('p', null, itemsText(order.items)));
  if (order.total_demo_price) art.append(el('p', 'muted', String(order.total_demo_price) + ' demo total'));
  return art;
}

function leadCard(lead, reload) {
  const art = el('article', 'record');
  art.append(el('h3', null, (lead.lead_id || 'Lead') + (lead.status ? ' · ' + lead.status : '')));
  art.append(el('p', null, [lead.name, lead.service].filter(Boolean).join(' · ')));
  if (lead.message) art.append(el('p', null, String(lead.message)));
  if (lead.followups) art.append(followList(lead.followups, lead.lead_id));
  const actions = el('div', 'row-actions');
  [['replied', 'Mark replied'], ['booked', 'Mark booked']].forEach((pair) => {
    const btn = el('button', 'btn secondary small', pair[1]);
    btn.type = 'button';
    btn.addEventListener('click', async () => {
      if (btn.dataset.busy === '1') return;
      btn.dataset.busy = '1';
      setBusy(btn, true);
      const res = await api({ action: 'lead.mark', lead_id: lead.lead_id, status: pair[0] });
      btn.dataset.busy = '0';
      setBusy(btn, false);
      if (!res || res.ok !== true) {
        if (res && res.error && res.error.code === 'disabled') { showPaused(); return; }
        const banner = art.querySelector('[data-banner]') || art.appendChild(bannerEl());
        showBanner(art, messageFor(res));
        return;
      }
      addEmails(res.emails);
      await reload();
      refreshInboxQuiet();
    });
    actions.append(btn);
  });
  art.append(actions);
  return art;
}

function bookingCard(booking) {
  const art = el('article', 'record');
  const title = (booking.booking_id || 'Booking') + (booking.status ? ' · ' + booking.status : '');
  art.append(el('h3', null, title));
  art.append(el('p', null, [booking.name, booking.service].filter(Boolean).join(' · ')));
  if (booking.slot_label) art.append(el('p', null, String(booking.slot_label)));
  if (booking.reminders) art.append(followList(booking.reminders, booking.booking_id));
  const token = safeToken(booking.manage_token);
  if (token) {
    const a = document.createElement('a');
    a.className = 'text-link';
    a.href = '#manage=' + token;
    a.textContent = 'Manage this booking';
    art.append(a);
  }
  return art;
}

function reviewCard(review) {
  const art = el('article', 'record');
  art.append(el('h3', null, review.review_id || 'Review request'));
  art.append(el('p', null, [review.name, review.job].filter(Boolean).join(' · ')));
  const rating = review.rating == null || review.rating === '' ? 'Not rated yet' : String(review.rating) + ' / 5';
  art.append(el('p', 'muted', rating + (review.outcome ? ' · ' + review.outcome : '')));
  const token = safeToken(review.rate_token);
  if (token) {
    const a = document.createElement('a');
    a.className = 'text-link';
    a.href = '#rate=' + token;
    a.textContent = 'Open the rating page';
    art.append(a);
  }
  return art;
}

function timewarpButton(label, action, body, reload) {
  const btn = el('button', 'btn secondary', label);
  btn.type = 'button';
  const result = successEl();
  btn.addEventListener('click', async () => {
    if (btn.dataset.busy === '1') return;
    btn.dataset.busy = '1';
    setBusy(btn, true);
    clear(result);
    const res = await api({ action: action });
    btn.dataset.busy = '0';
    setBusy(btn, false);
    if (!res || res.ok !== true) {
      if (res && res.error && res.error.code === 'disabled') { showPaused(); return; }
      result.append(el('p', 'banner', messageFor(res)));
      return;
    }
    addEmails(res.emails);
    const sent = res.data && res.data.sent != null ? res.data.sent : 0;
    const skipped = res.data && res.data.skipped != null ? res.data.skipped : 0;
    result.append(el('p', null, 'Sent ' + sent + ', skipped ' + skipped + '. Nothing was delivered to a real inbox.'));
    (res.emails || []).forEach((email) => result.append(emailCard(email)));
    if (reload) await reload();
    refreshInboxQuiet();
  });
  return { btn: btn, result: result };
}

function slotChoices(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (item && typeof item.slot === 'string') return { slot: item.slot, label: item.label || item.slot };
    return null;
  }).filter(Boolean);
}

function fillSlots(container, slots, groupName) {
  clear(container);
  if (!slots.length) {
    container.append(el('p', 'muted', 'No open times right now.'));
    return;
  }
  slots.forEach((item) => {
    const lab = el('label', 'slot');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = groupName;
    input.value = item.slot;
    const span = el('span', null, item.label);
    lab.append(input, span);
    container.append(lab);
  });
}

function viewShowcase() {
  const frag = document.createDocumentFragment();
  frag.append(el('p', 'kicker', 'Mango Studios · automation demo'));
  frag.append(heading('Automations that run themselves'));
  frag.append(el('p', 'lede', 'Four small examples of the kind of automations Mango Studios builds. Each one starts from a single action (a form, a booking, a button) and the rest happens on its own: emails, logs, reminders and follow-ups, with retries if a step fails. All businesses here are made up, prices are demo prices, and every email is shown in the Inbox on this page. Nothing is sent to a real inbox.'));
  const grid = el('div', 'cards');
  const cards = [
    ['DEMO 1 · DEMO BAKERY', 'Order form', 'A customer places an order and, on its own, the bakery gets the order, the customer gets a confirmation, and the order lands in a sheet.', 'order', 'orders'],
    ['DEMO 2 · DEMO LANDSCAPING CO.', 'Lead follow-up', 'A lead fills in a contact form and, on its own, gets an instant reply, the owner is told, the lead is logged, and polite follow-ups go out on day 1 and day 3 until the lead replies or books.', 'leads', 'leads'],
    ['DEMO 3 · DEMO HAIR STUDIO', 'Booking + reminders', 'A client books a time that can\'t be double-booked and, on its own, gets a confirmation and reminders 24 hours and 1 hour before, with a link to cancel or reschedule that updates everything.', 'book', 'bookings'],
    ['DEMO 4 · DEMO PLUMBING CO.', 'Review requests', 'The owner marks a job done and, on its own, the customer is asked for a rating; happy customers get a thank-you and a public review link, unhappy ones trigger a private alert to the owner.', 'reviews', 'reviews']
  ];
  cards.forEach((card) => {
    const art = el('article', 'card demo-card');
    art.append(el('p', 'kicker', card[0]));
    art.append(el('h2', null, card[1]));
    art.append(el('p', null, card[2]));
    const actions = el('div', 'actions');
    const tryIt = document.createElement('a');
    tryIt.className = 'btn';
    tryIt.href = '#' + card[3];
    tryIt.textContent = 'Try it';
    const log = el('button', 'btn secondary', 'View log');
    log.type = 'button';
    log.addEventListener('click', () => {
      state.inboxFilter = card[4];
      if (parseHash().view === 'inbox') render();
      else location.hash = 'inbox';
    });
    actions.append(tryIt, log);
    art.append(actions);
    grid.append(art);
  });
  frag.append(grid);
  return frag;
}

function viewOrder() {
  const frag = document.createDocumentFragment();
  frag.append(el('p', 'kicker', 'Demo 1 · order form'));
  frag.append(heading('Demo Bakery pre-orders'));
  frag.append(el('p', 'lede', 'Order ahead for pickup. When you submit, the bakery is notified, you get a confirmation email, and the order is logged to the order sheet. No one has to touch it.'));
  const card = el('div', 'card');
  const form = document.createElement('form');
  form.append(bannerEl());
  form.append(honeypot('order-website'));
  const name = document.createElement('input');
  name.name = 'name';
  name.type = 'text';
  name.autocomplete = 'name';
  name.maxLength = 80;
  const email = document.createElement('input');
  email.name = 'email';
  email.type = 'email';
  email.autocomplete = 'email';
  email.maxLength = 120;
  const phone = document.createElement('input');
  phone.name = 'phone';
  phone.type = 'tel';
  phone.autocomplete = 'tel';
  phone.maxLength = 20;
  const split = el('div', 'split');
  split.append(field('order-name', 'Your name', name, 'name'));
  split.append(field('order-email', 'Email', email, 'email'));
  form.append(split);
  form.append(field('order-phone', 'Phone (optional)', phone, 'phone'));
  const date = document.createElement('input');
  date.name = 'pickup_date';
  date.type = 'date';
  const today = torontoToday();
  const maxDays = (state.config && state.config.order_max_days_ahead) || 60;
  date.min = today;
  date.max = plusDays(today, maxDays);
  form.append(field('order-date', 'Pickup date', date, 'pickup_date'));
  form.append(el('p', 'group-label', 'What would you like?'));
  const itemsError = el('p', 'field-error');
  itemsError.setAttribute('data-error', 'items');
  form.append(itemsError);
  const menu = (state.config && state.config.menu) || [];
  const total = el('strong', null, '$0.00');
  menu.forEach((item) => {
    const row = el('div', 'item');
    row.setAttribute('data-field', 'items.' + item.sku);
    const copy = el('div');
    copy.append(el('div', 'item-name', item.name));
    copy.append(el('div', 'muted', String(item.demo_price) + ' · demo price'));
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = '20';
    input.step = '1';
    input.value = '0';
    input.setAttribute('data-sku', item.sku);
    input.setAttribute('aria-label', item.name + ' quantity');
    const err = el('p', 'field-error');
    err.setAttribute('data-error', 'items.' + item.sku);
    row.append(copy, input, err);
    form.append(row);
    input.addEventListener('input', () => {
      let cents = 0;
      form.querySelectorAll('[data-sku]').forEach((node) => {
        const qty = readQty(node);
        const found = menu.find((entry) => entry.sku === node.getAttribute('data-sku'));
        if (found && Number.isInteger(qty)) cents += found.cents * qty;
      });
      total.textContent = '$' + (cents / 100).toFixed(2);
    });
  });
  const totalLine = el('p', 'total', 'Demo total ');
  totalLine.append(total);
  form.append(totalLine);
  const notes = document.createElement('textarea');
  notes.name = 'notes';
  notes.maxLength = 500;
  form.append(field('order-notes', 'Notes (optional)', notes, 'notes'));
  const submit = el('button', 'btn', 'Place order');
  submit.type = 'submit';
  form.append(submit);
  form.append(el('p', 'fine', 'Demo only: Demo Bakery is a made-up business, prices are sample prices, and no payment is taken.'));
  form.append(successEl());
  const records = el('div');
  const reload = () => fillRecords(records, 'order.list', 'orders', orderCard);
  wireForm(form, {
    submit: (idem) => {
      const items = {};
      form.querySelectorAll('[data-sku]').forEach((input) => {
        items[input.getAttribute('data-sku')] = readQty(input);
      });
      return api({
        action: 'order.submit',
        idem_key: idem,
        website: websiteValue(form),
        name: formValue(form, 'name'),
        email: formValue(form, 'email'),
        phone: formValue(form, 'phone'),
        pickup_date: formValue(form, 'pickup_date'),
        notes: formValue(form, 'notes'),
        items: items
      });
    },
    after: reload
  });
  card.append(form);
  frag.append(card);
  const owner = el('section', 'card owner');
  owner.append(el('h2', null, 'Your orders'));
  owner.append(records);
  frag.append(owner);
  reload();
  return frag;
}

function viewLeads() {
  const frag = document.createDocumentFragment();
  frag.append(el('p', 'kicker', 'Demo 2 · lead follow-up'));
  frag.append(heading('Contact Demo Landscaping Co.'));
  frag.append(el('p', 'lede', 'Send a message. You get an instant reply, the owner is told, the lead is logged, and polite follow-ups go out on day 1 and day 3 until the lead is marked replied or booked.'));
  const card = el('div', 'card');
  const form = document.createElement('form');
  form.className = 'stack';
  form.append(bannerEl(), honeypot('lead-website'));
  const name = document.createElement('input');
  name.name = 'name';
  name.type = 'text';
  name.autocomplete = 'name';
  name.maxLength = 80;
  const email = document.createElement('input');
  email.name = 'email';
  email.type = 'email';
  email.autocomplete = 'email';
  email.maxLength = 120;
  const phone = document.createElement('input');
  phone.name = 'phone';
  phone.type = 'tel';
  phone.autocomplete = 'tel';
  phone.maxLength = 20;
  const split = el('div', 'split');
  split.append(field('lead-name', 'Your name', name, 'name'), field('lead-email', 'Email', email, 'email'));
  form.append(split, field('lead-phone', 'Phone (optional)', phone, 'phone'));
  const select = document.createElement('select');
  select.name = 'service';
  const blank = document.createElement('option');
  blank.value = '';
  blank.textContent = 'Choose one';
  select.append(blank);
  ((state.config && state.config.lead_services) || []).forEach((service) => {
    const opt = document.createElement('option');
    opt.value = service;
    opt.textContent = service;
    select.append(opt);
  });
  form.append(field('lead-service', 'Service', select, 'service'));
  const message = document.createElement('textarea');
  message.name = 'message';
  message.maxLength = 1000;
  form.append(field('lead-message', 'Message', message, 'message'));
  const submit = el('button', 'btn', 'Send message');
  submit.type = 'submit';
  form.append(submit, el('p', 'fine', 'Demo only: Demo Landscaping Co. is a made-up business. The reply and the follow-ups appear in the Inbox. Nothing is emailed.'), successEl());
  const records = el('div');
  const reload = () => fillRecords(records, 'lead.list', 'leads', (lead) => leadCard(lead, reload));
  wireForm(form, {
    submit: (idem) => api({
      action: 'lead.submit',
      idem_key: idem,
      website: websiteValue(form),
      name: formValue(form, 'name'),
      email: formValue(form, 'email'),
      phone: formValue(form, 'phone'),
      service: formValue(form, 'service'),
      message: formValue(form, 'message')
    }),
    after: reload
  });
  card.append(form);
  frag.append(card);
  const owner = el('section', 'card owner');
  owner.append(el('h2', null, 'Your leads'));
  owner.append(el('p', 'muted', 'Mark a lead replied or booked to cancel its follow-ups. Time warp releases this visit\'s scheduled follow-ups now.'));
  const warp = timewarpButton('Time warp: send follow-ups now', 'lead.timewarp', records, reload);
  owner.append(warp.btn, warp.result, records);
  frag.append(owner);
  reload();
  return frag;
}

function viewBook() {
  const frag = document.createDocumentFragment();
  frag.append(el('p', 'kicker', 'Demo 3 · booking + reminders'));
  frag.append(heading('Book at Demo Hair Studio'));
  frag.append(el('p', 'lede', 'Pick a time. You\'ll get a confirmation now, and reminders 24 hours and 1 hour before. Each email has a link to cancel or reschedule.'));
  const card = el('div', 'card');
  const form = document.createElement('form');
  form.className = 'stack';
  form.append(bannerEl(), honeypot('book-website'));
  const name = document.createElement('input');
  name.name = 'name';
  name.type = 'text';
  name.autocomplete = 'name';
  name.maxLength = 80;
  const email = document.createElement('input');
  email.name = 'email';
  email.type = 'email';
  email.autocomplete = 'email';
  email.maxLength = 120;
  const split = el('div', 'split');
  split.append(field('book-name', 'Your name', name, 'name'), field('book-email', 'Email', email, 'email'));
  form.append(split);
  const select = document.createElement('select');
  select.name = 'service';
  const blank = document.createElement('option');
  blank.value = '';
  blank.textContent = 'Choose one';
  select.append(blank);
  ((state.config && state.config.booking_services) || []).forEach((service) => {
    const opt = document.createElement('option');
    opt.value = service;
    opt.textContent = service;
    select.append(opt);
  });
  form.append(field('book-service', 'Service', select, 'service'));
  const box = document.createElement('fieldset');
  box.className = 'slots-box';
  const legend = el('legend', null, 'Available times');
  const slots = el('div', 'slots');
  box.append(legend, slots);
  const slotError = el('p', 'field-error');
  slotError.setAttribute('data-error', 'slot');
  form.append(box, slotError);
  const submit = el('button', 'btn', 'Book this time');
  submit.type = 'submit';
  form.append(submit, el('p', 'fine', 'Demo only: Demo Hair Studio is a made-up business with sample opening hours (Mon to Sat, 9 to 5).'), successEl());

  async function loadSlots(conflict) {
    const res = await api({ action: 'booking.slots' });
    if (!slots.isConnected) return;
    if (!res || res.ok !== true) {
      if (res && res.error && res.error.code === 'disabled') { showPaused(); return; }
      showBanner(form, messageFor(res));
      return;
    }
    const list = slotChoices(res.data && res.data.slots);
    legend.textContent = 'Available times (' + list.length + ' open, shown in Eastern Time)';
    fillSlots(slots, list, 'slot');
    if (conflict) showBanner(form, messageFor(conflict));
  }

  const records = el('div');
  const reload = () => fillRecords(records, 'booking.list', 'bookings', bookingCard);
  wireForm(form, {
    submit: (idem) => api({
      action: 'booking.create',
      idem_key: idem,
      website: websiteValue(form),
      name: formValue(form, 'name'),
      email: formValue(form, 'email'),
      service: formValue(form, 'service'),
      slot: formValue(form, 'slot')
    }),
    onConflict: async () => { await loadSlots(); },
    after: reload
  });
  card.append(form);
  frag.append(card);
  const owner = el('section', 'card owner');
  owner.append(el('h2', null, 'Your bookings'));
  owner.append(el('p', 'muted', 'Time warp sends reminders that are still scheduled for this visit\'s active bookings.'));
  const warp = timewarpButton('Time warp: send reminders now', 'booking.timewarp', records, reload);
  owner.append(warp.btn, warp.result, records);
  frag.append(owner);
  loadSlots();
  reload();
  return frag;
}

function viewReviews() {
  const frag = document.createDocumentFragment();
  frag.append(el('p', 'kicker', 'Demo 4 · review requests'));
  frag.append(heading('Mark a job done'));
  frag.append(el('p', 'lede', 'When a job is marked done, the customer is asked for a rating. Happy customers get a thank-you and a public review link. Unhappy ones trigger a private alert to the owner. If they don\'t rate, a nudge goes out on day 3.'));
  const card = el('div', 'card');
  const form = document.createElement('form');
  form.className = 'stack';
  form.append(bannerEl(), honeypot('review-website'));
  const name = document.createElement('input');
  name.name = 'name';
  name.type = 'text';
  name.autocomplete = 'name';
  name.maxLength = 80;
  const email = document.createElement('input');
  email.name = 'email';
  email.type = 'email';
  email.autocomplete = 'email';
  email.maxLength = 120;
  const split = el('div', 'split');
  split.append(field('review-name', 'Customer name', name, 'name'), field('review-email', 'Email', email, 'email'));
  const job = document.createElement('input');
  job.name = 'job';
  job.type = 'text';
  job.maxLength = 200;
  form.append(split, field('review-job', 'What was the job?', job, 'job'));
  const submit = el('button', 'btn', 'Mark job done');
  submit.type = 'submit';
  form.append(submit, el('p', 'fine', 'Demo only: Demo Plumbing Co. is a made-up business. The review request appears in the Inbox.'), successEl());
  const records = el('div');
  const reload = () => fillRecords(records, 'review.list', 'reviews', reviewCard);
  wireForm(form, {
    submit: (idem) => api({
      action: 'review.done',
      idem_key: idem,
      website: websiteValue(form),
      name: formValue(form, 'name'),
      email: formValue(form, 'email'),
      job: formValue(form, 'job')
    }),
    after: reload
  });
  card.append(form);
  frag.append(card);
  const owner = el('section', 'card owner');
  owner.append(el('h2', null, 'Your review requests'));
  owner.append(el('p', 'muted', 'Time warp sends the day-3 nudge for reviews that still have no rating.'));
  const warp = timewarpButton('Time warp: send rating nudges now', 'review.timewarp', records, reload);
  owner.append(warp.btn, warp.result, records);
  frag.append(owner);
  reload();
  return frag;
}

function viewManage(route) {
  const frag = document.createDocumentFragment();
  frag.append(el('p', 'kicker', 'Demo 3 · manage booking'));
  frag.append(heading('Your booking'));
  const body = el('div', 'card stack');
  body.append(el('p', 'muted', 'Loading…'));
  frag.append(body);
  loadManage(body, route.token);
  return frag;
}

async function loadManage(body, token) {
  const res = await api({ action: 'booking.get', token: token });
  if (!body.isConnected) return;
  clear(body);
  if (!res || res.ok !== true) {
    if (res && res.error && res.error.code === 'disabled') { showPaused(); return; }
    body.append(el('p', 'banner', messageFor(res)));
    return;
  }
  paintManage(body, res.data || {}, token);
}

function paintManage(body, data, token) {
  const booking = data.booking || {};
  body.append(el('h2', null, booking.booking_id || 'Booking'));
  body.append(el('p', null, [booking.name, booking.service].filter(Boolean).join(' · ')));
  const slotLine = el('p', null, booking.slot_label ? String(booking.slot_label) : '');
  const statusLine = el('p', 'muted', 'Status: ' + (booking.status || 'unknown'));
  body.append(slotLine, statusLine);
  if (booking.status === 'cancelled') {
    body.append(el('p', null, 'This booking is cancelled, and its reminders are cancelled too.'));
    return;
  }
  const form = document.createElement('form');
  form.className = 'stack';
  form.append(bannerEl());
  const box = document.createElement('fieldset');
  box.className = 'slots-box';
  const legend = el('legend', null, 'Reschedule');
  const slots = el('div', 'slots');
  const list = slotChoices(data.reschedule_slots);
  legend.textContent = 'Pick a new time (' + list.length + ' open, shown in Eastern Time)';
  fillSlots(slots, list, 'slot');
  box.append(legend, slots);
  const slotError = el('p', 'field-error');
  slotError.setAttribute('data-error', 'slot');
  const submit = el('button', 'btn', 'Reschedule');
  submit.type = 'submit';
  form.append(box, slotError, submit, successEl());
  wireForm(form, {
    submit: () => {
      const slot = formValue(form, 'slot');
      if (!slot) {
        return Promise.resolve({ ok: false, error: { code: 'validation', message: 'Pick a time first.', fields: { slot: 'Pick a time first.' } } });
      }
      return api({ action: 'booking.reschedule', token: token, slot: slot });
    },
    onConflict: async () => {
      const again = await api({ action: 'booking.get', token: token });
      if (!again || !again.ok || !again.data) return;
      if (again.data.booking && again.data.booking.status === 'cancelled') {
        statusLine.textContent = 'Status: cancelled';
        return;
      }
      const next = slotChoices(again.data.reschedule_slots);
      legend.textContent = 'Pick a new time (' + next.length + ' open, shown in Eastern Time)';
      fillSlots(slots, next, 'slot');
      if (again.data.booking && again.data.booking.slot_label) {
        slotLine.textContent = String(again.data.booking.slot_label);
      }
    },
    after: async (res) => {
      const nextBooking = res.data && res.data.booking;
      if (nextBooking && nextBooking.slot_label) slotLine.textContent = String(nextBooking.slot_label);
      if (nextBooking && nextBooking.status) statusLine.textContent = 'Status: ' + nextBooking.status;
      const again = await api({ action: 'booking.get', token: token });
      if (!again || !again.ok || !again.data || !form.isConnected) return;
      const next = slotChoices(again.data.reschedule_slots);
      legend.textContent = 'Pick a new time (' + next.length + ' open, shown in Eastern Time)';
      fillSlots(slots, next, 'slot');
    }
  });
  const cancel = el('button', 'btn secondary', 'Cancel this booking');
  cancel.type = 'button';
  cancel.addEventListener('click', async () => {
    if (cancel.dataset.busy === '1') return;
    cancel.dataset.busy = '1';
    setBusy(cancel, true);
    const res = await api({ action: 'booking.cancel', token: token });
    cancel.dataset.busy = '0';
    setBusy(cancel, false);
    if (!res || res.ok !== true) {
      if (res && res.error && res.error.code === 'disabled') { showPaused(); return; }
      showBanner(form, messageFor(res));
      return;
    }
    addEmails(res.emails);
    showSuccess(form, res);
    const nextBooking = res.data && res.data.booking;
    statusLine.textContent = 'Status: ' + ((nextBooking && nextBooking.status) || 'cancelled');
    box.hidden = true;
    submit.hidden = true;
    cancel.hidden = true;
    if (!res.data || res.data.already !== true) {
      body.append(el('p', null, 'This booking is cancelled, and its reminders are cancelled too.'));
    }
    refreshInboxQuiet();
  });
  body.append(form, cancel);
}

function viewRate(route) {
  const frag = document.createDocumentFragment();
  frag.append(el('p', 'kicker', 'Demo 4 · rate your visit'));
  frag.append(heading('How did we do?'));
  const body = el('div', 'card stack');
  body.append(el('p', 'muted', 'Loading…'));
  frag.append(body);
  loadRate(body, route.token);
  return frag;
}

async function loadRate(body, token) {
  const res = await api({ action: 'review.get', token: token });
  if (!body.isConnected) return;
  clear(body);
  if (!res || res.ok !== true) {
    if (res && res.error && res.error.code === 'disabled') { showPaused(); return; }
    body.append(el('p', 'banner', messageFor(res)));
    return;
  }
  const review = (res.data && res.data.review) || {};
  if (review.business) body.append(el('p', 'kicker', String(review.business)));
  if (review.job) body.append(el('p', null, String(review.job)));
  if (review.rating != null && review.rating !== '') {
    body.append(el('p', null, 'This review was already rated ' + String(review.rating) + ' / 5.'));
    return;
  }
  const form = document.createElement('form');
  form.className = 'stack';
  form.append(bannerEl());
  const stars = el('div', 'stars');
  let rating = 0;
  const ratingError = el('p', 'field-error');
  ratingError.setAttribute('data-error', 'rating');
  for (let n = 1; n <= 5; n += 1) {
    const btn = el('button', 'star', String(n));
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', n + (n === 1 ? ' star' : ' stars'));
    btn.addEventListener('click', () => {
      rating = n;
      stars.querySelectorAll('button').forEach((node) => {
        node.setAttribute('aria-pressed', node === btn ? 'true' : 'false');
      });
    });
    stars.append(btn);
  }
  const comment = document.createElement('textarea');
  comment.name = 'comment';
  comment.maxLength = 500;
  form.append(el('p', 'group-label', 'Rating'), stars, ratingError);
  form.append(field('rate-comment', 'Comment (optional)', comment, 'comment'));
  const submit = el('button', 'btn', 'Send rating');
  submit.type = 'submit';
  form.append(submit, successEl());
  wireForm(form, {
    submit: () => {
      if (!rating) {
        return Promise.resolve({
          ok: false,
          error: { code: 'validation', message: 'Pick a rating from 1 to 5.', fields: { rating: 'Pick a rating from 1 to 5.' } }
        });
      }
      const payload = { action: 'review.rate', token: token, rating: rating };
      const note = formValue(form, 'comment');
      if (note) payload.comment = note;
      return api(payload);
    }
  });
  body.append(form);
}

function viewPublic() {
  const frag = document.createDocumentFragment();
  frag.append(el('p', 'kicker', 'Demo 4 · public review'));
  frag.append(heading('Public review page'));
  const card = el('div', 'card');
  card.append(el('p', null, 'This is a placeholder. A live setup would link to the business\'s real public review page. Nothing is posted from this demo.'));
  frag.append(card);
  return frag;
}

function viewInvalid() {
  const frag = document.createDocumentFragment();
  frag.append(heading("This link isn't valid."));
  frag.append(el('p', null, "This link isn't valid."));
  return frag;
}

function noticeNode() {
  const p = el('p', 'notice');
  const strong1 = el('strong', null, 'Mango Studios automation demo.');
  const strong2 = el('strong', null, 'no real emails are sent');
  p.append(strong1, document.createTextNode(' All businesses are made up, prices are demo prices, and '), strong2, document.createTextNode('. Emails appear in the Inbox on this page. Please use a made-up name and email. Demo entries are stored in a Google Sheet and cleared regularly.'));
  return p;
}

function viewInbox() {
  const frag = document.createDocumentFragment();
  frag.append(el('p', 'kicker', 'Inbox'));
  frag.append(heading('Inbox'));
  frag.append(el('p', 'lede', 'Every simulated email for this visit, newest first. The backend never sends them.'));
  frag.append(noticeNode());
  const chips = el('div', 'chips');
  const filters = [
    ['all', 'All'],
    ['orders', demoBusiness('orders') || 'Demo Bakery'],
    ['leads', demoBusiness('leads') || 'Demo Landscaping Co.'],
    ['bookings', demoBusiness('bookings') || 'Demo Hair Studio'],
    ['reviews', demoBusiness('reviews') || 'Demo Plumbing Co.']
  ];
  filters.forEach((pair) => {
    const btn = el('button', 'chip', pair[1]);
    btn.type = 'button';
    btn.setAttribute('aria-pressed', state.inboxFilter === pair[0] ? 'true' : 'false');
    btn.addEventListener('click', () => {
      state.inboxFilter = pair[0];
      chips.querySelectorAll('button').forEach((node) => node.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      paintInbox();
    });
    chips.append(btn);
  });
  frag.append(chips);
  const emails = el('div');
  emails.id = 'inbox-emails';
  const scheduled = el('div');
  scheduled.id = 'inbox-scheduled';
  frag.append(el('h2', null, 'Emails'), emails, el('h2', null, 'Scheduled'), scheduled);
  paintInbox(emails, scheduled);
  return frag;
}

function paintInbox(emailNode, scheduledNode) {
  const emails = emailNode || document.getElementById('inbox-emails');
  const scheduled = scheduledNode || document.getElementById('inbox-scheduled');
  if (!emails || !scheduled) return;
  clear(emails);
  clear(scheduled);
  const shown = state.emails.filter((email) => state.inboxFilter === 'all' || email.demo === state.inboxFilter);
  if (!shown.length) emails.append(emptyNote('No simulated emails yet. Try one of the demos. Nothing here is sent to a real inbox.'));
  else shown.forEach((email) => emails.append(emailCard(email)));
  const upcoming = state.scheduled.filter((item) => state.inboxFilter === 'all' || item.demo === state.inboxFilter);
  if (!upcoming.length) scheduled.append(emptyNote('Nothing is scheduled.'));
  else upcoming.forEach((item) => scheduled.append(scheduledCard(item)));
}

function viewLoadError(message) {
  const frag = document.createDocumentFragment();
  frag.append(heading('Couldn\'t reach the demo'));
  frag.append(el('p', null, message || UNREACHABLE));
  const btn = el('button', 'btn', 'Try again');
  btn.type = 'button';
  btn.addEventListener('click', () => { init(); });
  frag.append(btn);
  return frag;
}

const VIEWS = {
  showcase: viewShowcase,
  order: viewOrder,
  leads: viewLeads,
  book: viewBook,
  reviews: viewReviews,
  manage: viewManage,
  rate: viewRate,
  public: viewPublic,
  inbox: viewInbox,
  invalid: viewInvalid
};

async function init() {
  ensureSession();
  updateBadge();
  state.ready = false;
  const app = document.getElementById('app');
  clear(app);
  app.append(el('p', 'muted', 'Loading the demo…'));
  const cfg = await api({ action: 'config' });
  if (!cfg || cfg.ok !== true) {
    if (cfg && cfg.error && cfg.error.code === 'disabled') { showPaused(); return; }
    clear(app);
    app.append(viewLoadError(messageFor(cfg)));
    return;
  }
  state.config = cfg.data;
  const inbox = await api({ action: 'inbox' });
  if (inbox && inbox.error && inbox.error.code === 'disabled') { showPaused(); return; }
  if (inbox && inbox.ok === true) absorbInbox(inbox);
  updateBadge();
  state.ready = true;
  render();
}

document.getElementById('nav-inbox').addEventListener('click', (event) => {
  state.inboxFilter = 'all';
  if (state.ready && parseHash().view === 'inbox') {
    event.preventDefault();
    render();
  }
});

window.addEventListener('hashchange', () => {
  if (state.ready) render();
});

init();
