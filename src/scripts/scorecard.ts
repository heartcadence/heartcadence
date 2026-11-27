// Scorecard wizard engine (KB-154, KB-155, KB-156). Reads one scorecard from the JSON block on the page.
// Flow: landing, contact details, scored questions, unscored questions, results.
// submitResults() saves to D1 and emails the lead notice with the PDF (KB-157, KB-166). KB-158 and KB-159 plug in on the server.
import type { Scorecard } from '../data/scorecards';
import { gaugeSvg, setNeedle } from '../lib/gauge';

interface Answer { key: string; label: string; points: number }
interface State {
  step: number;
  contact: { name: string; email: string; company: string; tips: boolean; call: boolean };
  answers: (string | null)[];
  extras: Record<string, string>;
}

const dataEl = document.getElementById('sc-data');
const app = document.getElementById('sc-app');
if (dataEl && app) {
  const { scorecard: SC, answers: ANSWERS } = JSON.parse(dataEl.textContent || '{}') as { scorecard: Scorecard; answers: Answer[] };
  const landingHtml = app.innerHTML;
  const NQ = SC.questions.length;
  const NE = SC.extras.length;
  const LAST = 2 + NQ + NE;
  const preview = new URLSearchParams(location.search).has('preview');
  const fresh = (): State => ({ step: 0, contact: { name: '', email: '', company: '', tips: false, call: false }, answers: Array(NQ).fill(null), extras: {} });
  let S = fresh();
  let submitted = false;
  let honeypot = '';
  let pdfUrl = '';
  let pdfName = '';

  const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  const pts = (k: string | null) => ANSWERS.find((a) => a.key === k)?.points ?? 0;
  const bandFor = (pct: number) => [...SC.bands].reverse().find((b) => pct >= b.min) ?? SC.bands[0];
  const bandIndex = (pct: number) => SC.bands.indexOf(bandFor(pct));

  function score() {
    const per = SC.categories.map((c) => {
      const idx = SC.questions.map((q, i) => (q.cat === c.id ? i : -1)).filter((i) => i >= 0);
      const got = idx.reduce((s, i) => s + pts(S.answers[i]), 0);
      return { ...c, pct: Math.round((got / idx.length) * 100) };
    });
    const total = Math.round((S.answers.reduce((s, a) => s + pts(a), 0) / NQ) * 100);
    const sorted = [...per].sort((a, b) => b.pct - a.pct);
    return { per, total, band: bandFor(total), best: sorted[0], weak: sorted[sorted.length - 1] };
  }

  function payload() {
    const r = score();
    const c = S.contact;
    return {
      scorecard: SC.slug,
      submittedAt: new Date().toISOString(),
      contact: { name: c.name, email: c.email, company: c.company },
      consent: { marketingEmail: c.tips, followUpCall: c.call },
      score: r.total,
      band: r.band.name,
      categories: Object.fromEntries(r.per.map((p) => [p.id, p.pct])),
      answers: SC.questions.map((q, i) => ({ q: i + 1, category: q.cat, answer: S.answers[i] })),
      qualifying: S.extras,
      crmLead: c.call
        ? {
            best: `${r.best.name} (${r.best.pct}%)`,
            weakest: `${r.weak.name} (${r.weak.pct}%)`,
            callScript: [
              `Your strongest area was ${r.best.name}, at ${r.best.pct}%. That is a strong base.`,
              `Your lowest area was ${r.weak.name}, at ${r.weak.pct}%.`,
              'Would you like to improve your score?',
            ],
          }
        : null,
    };
  }

  // KB-157: saves to D1 and emails the lead notice (functions/api/scorecard.ts).
  // The server checks everything and works out the score again. A failure never blocks the results.
  // Builds the one-page PDF report in the browser (KB-166). Returns base64, or '' if it fails.
  async function buildPdf(): Promise<string> {
    try {
      const { buildReportPdf, toBase64, pdfFileName } = await import('./scorecard-pdf');
      const r = score();
      const cta = ctaFor(r.total);
      const bytes = await buildReportPdf({
        sc: SC, total: r.total, bandName: r.band.name, carrot: r.band.carrot, stick: r.band.stick,
        per: r.per, best: r.best, weak: r.weak, name: S.contact.name, company: S.contact.company,
        ctaTitle: cta.title, ctaText: cta.text, bandStarts: SC.bands.map((b) => b.min),
      });
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      pdfUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      pdfName = pdfFileName(SC, S.contact.company);
      const a = document.getElementById('sc-pdf') as HTMLAnchorElement | null;
      if (a) { a.href = pdfUrl; a.download = pdfName; a.hidden = false; }
      return toBase64(bytes);
    } catch {
      return '';
    }
  }

  async function submitResults() {
    const pdf = await buildPdf();
    try {
      const c = S.contact;
      await fetch('/api/scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scorecard: SC.slug,
          website: honeypot,
          contact: { name: c.name, email: c.email, company: c.company },
          consent: { marketingEmail: c.tips, followUpCall: c.call },
          answers: S.answers,
          qualifying: S.extras,
          pdf,
        }),
      });
    } catch {
      // Network error: the visitor still sees their results.
    }
  }

  const go = (n: number) => { S.step = Math.max(0, Math.min(LAST, n)); render(); app.scrollIntoView({ block: 'start' }); };

  // Counts questions only (scored and unscored). The contact step shows no count.
  function progress(label: string) {
    const tot = NQ + NE;
    const n = S.step - 1;
    const count = S.step >= 2 ? `<span>Question ${n} of ${tot}</span>` : '';
    return `<div class="sc-prog"><div class="sc-progmeta"><span>${esc(label)}</span>${count}</div><div class="sc-track"><i style="width:${Math.round((Math.max(0, n - 1) / tot) * 100)}%"></i></div></div>`;
  }

  function vContact() {
    const c = S.contact;
    return `${progress('Your details')}<h2>Where should we send your results?</h2>
<p class="sc-small">We use these details to prepare your report. You can download it as a PDF at the end.</p>
<form id="sc-form" novalidate>
<div class="sc-field"><label for="sc-name">Your name</label><input type="text" id="sc-name" autocomplete="name" value="${esc(c.name)}" aria-describedby="sc-e-name"><p class="sc-err" id="sc-e-name"></p></div>
<div class="sc-field"><label for="sc-email">Work email</label><input type="email" id="sc-email" autocomplete="email" value="${esc(c.email)}" aria-describedby="sc-e-email"><p class="sc-err" id="sc-e-email"></p></div>
<div class="sc-field"><label for="sc-company">Company</label><input type="text" id="sc-company" autocomplete="organization" value="${esc(c.company)}" aria-describedby="sc-e-company"><p class="sc-err" id="sc-e-company"></p></div>
<div class="sc-hp" aria-hidden="true"><label for="sc-website">Website</label><input type="text" id="sc-website" name="website" tabindex="-1" autocomplete="off"></div>
<label class="sc-check"><input type="checkbox" id="sc-tips" ${c.tips ? 'checked' : ''}><span>Send me occasional tips and updates from Heart Cadence Inc. by email. I can unsubscribe at any time.</span></label>
<label class="sc-check"><input type="checkbox" id="sc-call" ${c.call ? 'checked' : ''}><span>I would like a follow-up call from Heart Cadence Inc. about my results.</span></label>
<p class="sc-small">Read how we use, store and delete your answers in our <a href="/privacy/" target="_blank" rel="noopener">privacy policy<span class="sr-only"> (opens in a new tab)</span></a>.</p>
<div class="sc-row sc-between"><button type="button" class="btn-secondary" data-back>Back</button><button type="submit" class="btn-primary">Start the questions</button></div>
</form>`;
  }

  function vQuestion(i: number) {
    const q = SC.questions[i];
    const cat = SC.categories.find((c) => c.id === q.cat);
    return `${progress(cat?.name ?? '')}<h2 class="sc-q">${esc(q.text)}</h2>
<div class="sc-opts" role="group" aria-label="Your answer">${ANSWERS.map((a, n) => `<button type="button" class="sc-opt" data-a="${a.key}" aria-pressed="${S.answers[i] === a.key}"><span class="sc-key" aria-hidden="true">${n + 1}</span>${esc(a.label)}</button>`).join('')}</div>
<div class="sc-row sc-between"><button type="button" class="btn-secondary" data-back>Back</button><span class="sc-small sc-hint">You can also press 1, 2 or 3</span></div>`;
  }

  function vExtra(i: number) {
    const x = SC.extras[i];
    const v = S.extras[x.id];
    const last = i === NE - 1;
    const body = x.options
      ? `<div class="sc-opts" role="group" aria-label="Your answer">${x.options.map((o, n) => `<button type="button" class="sc-opt" data-x="${n}" aria-pressed="${v === o}">${esc(o)}</button>`).join('')}</div>`
      : `<div class="sc-field"><label for="sc-free" class="sc-small sc-normal">Optional</label><textarea id="sc-free" rows="5">${esc(v || '')}</textarea></div>`;
    return `${progress('A little about you')}<p class="sc-tag">Not scored. Helps us tailor your report.</p><h2 class="sc-q">${esc(x.text)}</h2>${body}
<div class="sc-row sc-between"><button type="button" class="btn-secondary" data-back>Back</button>${x.options ? '' : `<button type="button" class="btn-primary" id="sc-next">${last ? 'See my results' : 'Next'}</button>`}</div>`;
  }

  function ctaFor(total: number) {
    const selfServe = (S.extras.help || '').startsWith('Do it myself');
    if (total >= SC.bands[SC.bands.length - 1].min) return SC.ctaHigh;
    return selfServe
      ? { title: 'Keep going on your own', text: 'Work through the tips in your report. When you want a second opinion, we are a short call away.' }
      : { title: 'Talk it through with us', text: 'Book a short call. We will walk through your answers with you and help you close the gaps.' };
  }

  function vResults() {
    const r = score();
    const c = S.contact;
    const help = S.extras.help || '';
    const selfServe = help.startsWith('Do it myself');
    const high = r.total >= SC.bands[SC.bands.length - 1].min;
    const cta = ctaFor(r.total);
    const buttons = selfServe && !high
      ? `<a class="btn-primary" href="${SC.serviceHref}">${esc(SC.serviceLabel)}</a><a class="btn-secondary" href="/book-a-call/">Book a call</a>`
      : `<a class="btn-primary" href="/book-a-call/">Book a call</a><a class="btn-secondary" href="${SC.serviceHref}">${esc(SC.serviceLabel)}</a>`;
    const first = c.name.split(' ')[0];
    const tip = (t: { text: string; href?: string; linkText?: string }) =>
      `<li>${esc(t.text)}${t.href ? ` <a href="${esc(t.href)}" rel="noopener">${esc(t.linkText || 'Learn more')}<span class="sr-only"> (external site)</span></a>` : ''}</li>`;
    return `<div class="sc-res">
<div><div class="sc-gaugebox">${gaugeSvg(`Score: ${r.total} out of 100`)}<p class="sc-score">${r.total}</p><p class="sc-band">${esc(r.band.name)}</p></div>
<div class="sc-cats">${r.per.map((p) => `<div class="sc-cat"><div class="sc-catmeta"><b>${esc(p.name)}</b><span>${p.pct}%</span></div><div class="sc-bar"><div class="sc-fill sc-z${bandIndex(p.pct)}" data-w="${p.pct}"></div></div></div>`).join('')}</div></div>
<div><h2 class="sc-rtitle">${first ? `${esc(first)}, here is your ` : 'Here is your '}${esc(SC.resultTitle)}</h2>
<p class="sc-lead">${esc(r.band.carrot)}</p><p>${esc(r.band.stick)}</p>
<div class="sc-split"><div class="sc-panel"><p class="sc-tag">Strongest area</p><p><b>${esc(r.best.name)}</b> <span class="sc-small">${r.best.pct}%</span></p></div><div class="sc-panel"><p class="sc-tag">Area to work on</p><p><b>${esc(r.weak.name)}</b> <span class="sc-small">${r.weak.pct}%</span></p></div></div></div>
</div>
<hr class="sc-hr">
<div class="sc-split"><div><h3>Tips for ${esc(r.weak.name.toLowerCase())}</h3><div class="sc-panel"><ul class="sc-tips">${r.weak.tips.map(tip).join('')}</ul></div></div>
<div><h3>${esc(cta.title)}</h3><p>${esc(cta.text)}</p><div class="sc-row sc-noprint">${buttons}</div></div></div>
<hr class="sc-hr">
<div class="sc-row sc-between sc-noprint"><p class="sc-small">Download your report to share with your team.</p>
<div class="sc-row"><a class="btn-primary" id="sc-pdf" hidden>Download PDF report</a><button type="button" class="btn-secondary" id="sc-print">Print</button><button type="button" class="btn-secondary" id="sc-again">Start over</button></div></div>
${preview ? `<details class="sc-noprint sc-preview"><summary>Preview only: the record that will be saved</summary><p class="sc-small">Shown because the page address ends in ?preview. This record is now saved and emailed to the lead mailbox. The visitor's results email and the CRM lead are not built yet (KB-158, KB-159).</p><pre>${esc(JSON.stringify(payload(), null, 2))}</pre></details>` : ''}`;
  }

  function render() {
    const s = S.step;
    if (s === 0) {
      app!.innerHTML = landingHtml;
      setNeedle(app!, 72);
      return;
    }
    let h: string;
    if (s === 1) h = vContact();
    else if (s < 2 + NQ) h = vQuestion(s - 2);
    else if (s < LAST) h = vExtra(s - 2 - NQ);
    else h = vResults();
    app!.innerHTML = `<div class="sc-screen">${h}</div>`;
    app!.classList.toggle('sc-wide', s === LAST);
    if (s === LAST) {
      setNeedle(app!, score().total);
      requestAnimationFrame(() => requestAnimationFrame(() => app!.querySelectorAll<HTMLElement>('.sc-fill').forEach((f) => { f.style.width = `${f.dataset.w}%`; })));
      if (!submitted) { submitted = true; submitResults(); }
    }
    app!.querySelector<HTMLElement>('h2')?.setAttribute('tabindex', '-1');
    app!.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  }

  function saveContact() {
    const v = (id: string) => (document.getElementById(id) as HTMLInputElement);
    honeypot = v('sc-website').value;
    S.contact = { name: v('sc-name').value.trim(), email: v('sc-email').value.trim(), company: v('sc-company').value.trim(), tips: v('sc-tips').checked, call: v('sc-call').checked };
  }

  function pick(btn: HTMLElement, apply: () => void) {
    apply();
    app!.querySelectorAll('.sc-opt').forEach((o) => o.setAttribute('aria-pressed', String(o === btn)));
    setTimeout(() => go(S.step + 1), 220);
  }

  app.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest('button');
    if (!t) return;
    if (t.id === 'sc-start') return go(1);
    if (t.hasAttribute('data-back')) {
      if (S.step === 1) saveContact();
      const ta = document.getElementById('sc-free') as HTMLTextAreaElement | null;
      if (ta) S.extras.comments = ta.value.trim();
      return go(S.step - 1);
    }
    if (t.dataset.a) return pick(t, () => { S.answers[S.step - 2] = t.dataset.a!; });
    if (t.dataset.x) return pick(t, () => { const x = SC.extras[S.step - 2 - NQ]; S.extras[x.id] = x.options![Number(t.dataset.x)]; });
    if (t.id === 'sc-next') { S.extras.comments = (document.getElementById('sc-free') as HTMLTextAreaElement).value.trim(); return go(S.step + 1); }
    if (t.id === 'sc-print') return window.print();
    if (t.id === 'sc-again') { S = fresh(); submitted = false; return go(0); }
  });

  app.addEventListener('submit', (e) => {
    e.preventDefault();
    saveContact();
    const c = S.contact;
    let firstBad: string | null = null;
    const set = (id: string, msg: string) => {
      const el = document.getElementById(`sc-e-${id}`)!;
      el.textContent = msg;
      document.getElementById(`sc-${id}`)!.setAttribute('aria-invalid', String(Boolean(msg)));
      if (msg && !firstBad) firstBad = id;
    };
    set('name', c.name ? '' : 'Please enter your name.');
    set('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email) ? '' : 'Please enter a valid email address.');
    set('company', c.company ? '' : 'Please enter your company name.');
    if (firstBad) document.getElementById(`sc-${firstBad}`)!.focus();
    else go(2);
  });

  document.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).matches('input, textarea, select')) return;
    if (S.step >= 2 && S.step < 2 + NQ && ['1', '2', '3'].includes(e.key)) {
      app.querySelectorAll<HTMLButtonElement>('.sc-opt')[Number(e.key) - 1]?.click();
    }
  });

  setNeedle(app, 72);
}
