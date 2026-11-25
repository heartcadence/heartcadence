// POST /api/scorecard (KB-157, plus the lead notice email). Cloudflare Pages Function.
// 1. Checks the submission and works out the score again on the server (the browser's score is not trusted).
// 2. Saves it to D1 (binding DB: hci-scorecards in production, hci-scorecards-dev in preview).
// 3. Emails the lead to NOTIFY_TO through the Gmail API, sent from the GMAIL_SENDER mailbox.
// The visitor's own results email (KB-158) will reuse sendGmail().
//
// Bindings and settings (Cloudflare Pages > heartcadence > Settings), for Production and Preview:
//   DB                    D1 binding
//   GMAIL_CLIENT_ID       secret, Google OAuth client ID
//   GMAIL_CLIENT_SECRET   secret, Google OAuth client secret
//   GMAIL_REFRESH_TOKEN   secret, refresh token for the sender mailbox, scope gmail.send
//   GMAIL_SENDER          variable, the mailbox that sends (the shared info mailbox)
//   NOTIFY_TO             variable, where lead notices go (the shared info mailbox)
import { scorecards, ANSWERS } from '../../src/data/scorecards';

interface D1Stmt { bind(...v: unknown[]): D1Stmt; first<T = Record<string, unknown>>(): Promise<T | null>; run(): Promise<unknown> }
interface Env {
  DB?: { prepare(sql: string): D1Stmt };
  GMAIL_CLIENT_ID?: string;
  GMAIL_CLIENT_SECRET?: string;
  GMAIL_REFRESH_TOKEN?: string;
  GMAIL_SENDER?: string;
  NOTIFY_TO?: string;
}
interface Ctx { request: Request; env: Env }

const MAX_BODY = 8000;
const MAX_PER_HOUR = 5; // per visitor IP

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// One line, no control characters, capped. Stops header injection in the email.
const clean = (v: unknown, max = 200) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function b64(text: string) {
  let bin = '';
  for (const b of new TextEncoder().encode(text)) bin += String.fromCharCode(b);
  return btoa(bin);
}
const b64url = (text: string) => b64(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
// RFC 2047 encoded word, so names and accents survive in the subject.
const encodeHeader = (text: string) => `=?UTF-8?B?${b64(text)}?=`;

export async function sendGmail(env: Env, msg: { to: string; subject: string; text: string; replyTo?: string }) {
  if (!env.GMAIL_CLIENT_ID || !env.GMAIL_CLIENT_SECRET || !env.GMAIL_REFRESH_TOKEN || !env.GMAIL_SENDER || !msg.to) {
    throw new Error('Gmail settings are missing');
  }
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      refresh_token: env.GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!tokenRes.ok) throw new Error(`Google token error ${tokenRes.status}`);
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const headers = [
    `From: Heart Cadence Inc. <${env.GMAIL_SENDER}>`,
    `To: ${msg.to}`,
    msg.replyTo ? `Reply-To: ${msg.replyTo}` : '',
    `Subject: ${encodeHeader(msg.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ].filter(Boolean);
  const bodyB64 = (b64(msg.text.replace(/\r?\n/g, '\r\n')).match(/.{1,76}/g) || []).join('\r\n');
  const raw = b64url(`${headers.join('\r\n')}\r\n\r\n${bodyB64}`);
  const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });
  if (!sendRes.ok) throw new Error(`Gmail send error ${sendRes.status}`);
}

export const onRequestPost = async ({ request, env }: Ctx) => {
  if (!env.DB) return json(503, { ok: false, error: 'Not set up yet' });

  const text = await request.text();
  if (text.length > MAX_BODY) return json(413, { ok: false });
  let body: Record<string, any>;
  try { body = JSON.parse(text); } catch { return json(400, { ok: false }); }

  // Honeypot: a hidden field people never see. Bots fill it in. Pretend it worked.
  if (clean(body.website)) return json(200, { ok: true });

  const sc = scorecards.find((s) => s.slug === body.scorecard);
  if (!sc) return json(400, { ok: false });

  const name = clean(body.contact?.name, 120);
  const email = clean(body.contact?.email, 200);
  const company = clean(body.contact?.company, 160);
  if (!name || !company || !/^[^\s@<>",]+@[^\s@<>",]+\.[^\s@<>",]{2,}$/.test(email)) return json(400, { ok: false });

  const answers: string[] = Array.isArray(body.answers) ? body.answers.map((a: unknown) => String(a)) : [];
  if (answers.length !== sc.questions.length || answers.some((a) => !ANSWERS.some((x) => x.key === a))) return json(400, { ok: false });

  // Unscored answers must be one of the listed options.
  const qualifying: Record<string, string> = {};
  for (const x of sc.extras) {
    const v = clean(body.qualifying?.[x.id], 500);
    qualifying[x.id] = x.options ? (x.options.includes(v) ? v : '') : v;
  }

  // Score again on the server.
  const pts = (k: string) => ANSWERS.find((a) => a.key === k)?.points ?? 0;
  const per = sc.categories.map((c) => {
    const idx = sc.questions.map((q, i) => (q.cat === c.id ? i : -1)).filter((i) => i >= 0);
    return { id: c.id, name: c.name, pct: Math.round((idx.reduce((s, i) => s + pts(answers[i]), 0) / idx.length) * 100) };
  });
  const score = Math.round((answers.reduce((s, a) => s + pts(a), 0) / answers.length) * 100);
  const band = [...sc.bands].reverse().find((b) => score >= b.min) ?? sc.bands[0];
  const sorted = [...per].sort((a, b) => b.pct - a.pct);
  const best = sorted[0];
  const weak = sorted[sorted.length - 1];

  const marketing = body.consent?.marketingEmail === true;
  const call = body.consent?.followUpCall === true;

  // Rate limit by a hash of the IP address. The IP itself is not stored.
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ipHash = ip ? await sha256(`hci-scorecards:${ip}`) : null;
  if (ipHash) {
    const since = new Date(Date.now() - 3600_000).toISOString();
    const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM submissions WHERE ip_hash = ? AND created_at > ?').bind(ipHash, since).first<{ n: number }>();
    if ((row?.n ?? 0) >= MAX_PER_HOUR) return json(429, { ok: false });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const answerRows = sc.questions.map((q, i) => ({ q: i + 1, category: q.cat, text: q.text, answer: answers[i] }));

  await env.DB.prepare(
    `INSERT INTO submissions (id, created_at, scorecard, name, email, company, marketing_consent, call_requested, score, band, categories_json, answers_json, qualifying_json, ip_hash, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id, createdAt, sc.slug, name, email, company, marketing ? 1 : 0, call ? 1 : 0, score, band.name,
    JSON.stringify(Object.fromEntries(per.map((p) => [p.id, p.pct]))), JSON.stringify(answerRows), JSON.stringify(qualifying),
    ipHash, clean(request.headers.get('User-Agent'), 300),
  ).run();

  // Lead notice. Plain text so the Pipeline mailbox scan can read it.
  const label = (k: string) => ANSWERS.find((a) => a.key === k)?.label ?? k;
  const when = new Date(createdAt).toLocaleString('en-CA', { timeZone: 'America/Toronto', dateStyle: 'medium', timeStyle: 'short' });
  const lines = [
    `New scorecard lead: ${sc.cardTitle}`,
    '',
    `Name: ${name}`,
    `Company: ${company}`,
    `Email: ${email}`,
    `Wants a follow-up call: ${call ? 'YES' : 'No'}`,
    `Agreed to marketing emails (CASL): ${marketing ? 'Yes' : 'No'}`,
    `Submitted: ${when} (Toronto time)`,
    '',
    `Score: ${score} out of 100 (${band.name})`,
    ...per.map((p) => `- ${p.name}: ${p.pct}%`),
    `Strongest area: ${best.name} (${best.pct}%)`,
    `Area to work on: ${weak.name} (${weak.pct}%)`,
    '',
    'About them (not scored):',
    ...sc.extras.map((x) => `- ${x.text} ${qualifying[x.id] || '(no answer)'}`),
    '',
    'Answers:',
    ...answerRows.map((a) => `${a.q}. ${label(a.answer)}: ${a.text}`),
    '',
    ...(call
      ? [
          'Call script:',
          `1. You scored highest on ${best.name.toLowerCase()}, at ${best.pct}%. That is a strong base.`,
          `2. Your lowest area was ${weak.name.toLowerCase()}, at ${weak.pct}%.`,
          '3. Would you like to improve your score?',
          '',
        ]
      : []),
    `Record ID: ${id} (D1 table submissions)`,
    'Reply to this email to write to the lead directly.',
  ];

  let emailed = 0;
  let emailError: string | null = null;
  try {
    await sendGmail(env, {
      to: env.NOTIFY_TO || env.GMAIL_SENDER || '',
      subject: `Scorecard lead: ${company}, ${score}/100 on ${sc.cardTitle}${call ? ', wants a call' : ''}`,
      text: lines.join('\n'),
      replyTo: `${encodeHeader(name)} <${email}>`,
    });
    emailed = 1;
  } catch (e) {
    emailError = clean((e as Error).message, 300);
  }
  await env.DB.prepare('UPDATE submissions SET emailed = ?, email_error = ? WHERE id = ?').bind(emailed, emailError, id).run();

  return json(200, { ok: true, id });
};
