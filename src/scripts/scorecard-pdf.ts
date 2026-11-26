// One-page PDF report of a visitor's scorecard results (KB-166).
// Built in the browser with pdf-lib, so it costs no server time. Loaded only when results show.
// Uses the standard PDF fonts (Times for headings, Helvetica for body) to keep the file small.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import type { Scorecard, Tip } from '../data/scorecards';

export interface ReportInput {
  sc: Scorecard;
  total: number;
  bandName: string;
  carrot: string;
  stick: string;
  per: { name: string; pct: number }[];
  best: { name: string; pct: number };
  weak: { name: string; pct: number; tips: Tip[] };
  name: string;
  company: string;
  ctaTitle: string;
  ctaText: string;
  bandStarts: number[]; // e.g. [0, 50, 80]
}

const hex = (h: string): RGB => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const C = {
  navy: hex('#0F2A44'), slate: hex('#3B5B7A'), copper: hex('#B4472F'), teal: hex('#2F7D79'),
  border: hex('#D6D0C4'), alt: hex('#F2EEE8'), text: hex('#1E2329'), white: hex('#FFFFFF'), offwhite: hex('#F7F5F1'),
};
const ZONE = [C.copper, C.slate, C.teal];

const W = 612; // US Letter
const H = 792;
const M = 54; // margin

export async function buildReportPdf(r: ReportInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${r.sc.cardTitle}: ${r.company}`);
  doc.setAuthor('Heart Cadence Inc.');
  doc.setSubject(`${r.sc.cardTitle} report`);
  const page = doc.addPage([W, H]);
  const serif = await doc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Standard fonts only cover Western characters. Swap anything else so the PDF never fails.
  const safe = (font: PDFFont, s: string) =>
    [...s].map((ch) => { try { font.encodeText(ch); return ch; } catch { return '?'; } }).join('');

  const wrap = (font: PDFFont, size: number, text: string, maxW: number) => {
    const lines: string[] = [];
    let line = '';
    // Break any single word (such as a long web address) that is wider than the line.
    const words = safe(font, text).split(/\s+/).flatMap((w) => {
      if (font.widthOfTextAtSize(w, size) <= maxW) return [w];
      const parts: string[] = [];
      let cur = '';
      for (const ch of w) {
        if (cur && font.widthOfTextAtSize(cur + ch, size) > maxW) { parts.push(cur); cur = ''; }
        cur += ch;
      }
      return cur ? [...parts, cur] : parts;
    });
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) <= maxW || !line) line = test;
      else { lines.push(line); line = word; }
    }
    if (line) lines.push(line);
    return lines;
  };

  // Draws wrapped text from the top line's baseline. Returns the y below the block.
  const para = (p: PDFPage, text: string, x: number, y: number, o: { font?: PDFFont; size?: number; color?: RGB; maxW?: number; lead?: number } = {}) => {
    const font = o.font ?? sans;
    const size = o.size ?? 10.5;
    const lead = o.lead ?? size * 1.4;
    for (const l of wrap(font, size, text, o.maxW ?? W - 2 * M)) {
      p.drawText(l, { x, y, size, font, color: o.color ?? C.text });
      y -= lead;
    }
    return y;
  };

  const zoneFor = (pct: number) => ZONE[Math.max(0, r.bandStarts.filter((s) => pct >= s).length - 1)];
  const date = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  // Header: the real logo file (fonts already turned into shapes), never rebuilt in another font.
  page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: C.navy });
  try {
    const png = await doc.embedPng(await (await fetch('/images/heart-cadence-logo.png')).arrayBuffer());
    const lh = 32;
    page.drawImage(png, { x: M, y: H - 52, width: (png.width / png.height) * lh, height: lh });
  } catch {
    page.drawText('Heart Cadence Inc.', { x: M, y: H - 44, size: 20, font: serif, color: C.navy });
  }
  page.drawText('heartcadence.com', { x: W - M - sans.widthOfTextAtSize('heartcadence.com', 10), y: H - 40, size: 10, font: sans, color: C.slate });
  page.drawLine({ start: { x: M, y: H - 66 }, end: { x: W - M, y: H - 66 }, thickness: 0.75, color: C.border });

  // Title
  let y = H - 104;
  page.drawText(safe(serif, r.sc.cardTitle), { x: M, y, size: 24, font: serif, color: C.navy });
  y -= 20;
  y = para(page, `Prepared for ${r.name} at ${r.company} on ${date}`, M, y, { size: 10.5, color: C.slate });

  // Gauge (same geometry as the website: a 200 x 112 box)
  const gx = M;
  const gTop = y - 8;
  const s = 1.05;
  const pt = (p: number, rad = 80) => [100 - rad * Math.cos(Math.PI * p), 100 - rad * Math.sin(Math.PI * p)];
  const arc = (a: number, b: number) => {
    const [x1, y1] = pt(a);
    const [x2, y2] = pt(b);
    return `M ${x1} ${y1} A 80 80 0 0 1 ${x2} ${y2}`;
  };
  page.drawRectangle({ x: gx, y: gTop - 170, width: 230, height: 170, color: C.alt });
  const ox = gx + 10;
  const oy = gTop - 8;
  const zones: [number, number][] = [[0, 0.495], [0.505, 0.795], [0.805, 1]];
  zones.forEach(([a, b], i) => page.drawSvgPath(arc(a, b), { x: ox, y: oy, scale: s, borderColor: ZONE[i], borderWidth: 18 * s }));
  const p = Math.max(0, Math.min(1, r.total / 100));
  const th = Math.PI * p;
  const tip = [100 - 70 * Math.cos(th), 100 - 70 * Math.sin(th)];
  const nx = 4 * Math.sin(th);
  const ny = -4 * Math.cos(th);
  page.drawSvgPath(`M ${tip[0]} ${tip[1]} L ${100 + nx} ${100 + ny} L ${100 - nx} ${100 - ny} Z`, { x: ox, y: oy, scale: s, color: C.navy });
  page.drawCircle({ x: ox + 100 * s, y: oy - 100 * s, size: 7, color: C.navy });
  const score = String(r.total);
  page.drawText(score, { x: gx + 115 - serif.widthOfTextAtSize(score, 40) / 2, y: gTop - 150, size: 40, font: serif, color: C.navy });
  const band = safe(bold, r.bandName);
  page.drawText(band, { x: gx + 115 - bold.widthOfTextAtSize(band, 11) / 2, y: gTop - 164, size: 11, font: bold, color: C.navy });

  // Category bars beside the gauge
  const bx = gx + 254;
  const bw = W - M - bx;
  let by = gTop - 14;
  page.drawText('Your score by area', { x: bx, y: by, size: 13, font: serif, color: C.navy });
  by -= 26;
  for (const c of r.per) {
    page.drawText(safe(bold, c.name), { x: bx, y: by, size: 10.5, font: bold, color: C.navy });
    const pct = `${c.pct}%`;
    page.drawText(pct, { x: bx + bw - sans.widthOfTextAtSize(pct, 10.5), y: by, size: 10.5, font: sans, color: C.text });
    by -= 14;
    page.drawRectangle({ x: bx, y: by, width: bw, height: 9, color: C.alt });
    if (c.pct > 0) page.drawRectangle({ x: bx, y: by, width: Math.max(3, (bw * c.pct) / 100), height: 9, color: zoneFor(c.pct) });
    by -= 24;
  }
  page.drawText(`Score out of 100. Bands start at ${r.bandStarts.join(', ')}.`, { x: bx, y: gTop - 164, size: 8.5, font: sans, color: C.slate });

  // What it means
  y = gTop - 196;
  page.drawText('What this means', { x: M, y, size: 15, font: serif, color: C.navy });
  y -= 20;
  y = para(page, r.carrot, M, y, { size: 11.5, color: C.slate });
  y = para(page, r.stick, M, y - 2, { size: 10.5 });

  // Strongest and weakest
  y -= 10;
  const boxW = (W - 2 * M - 14) / 2;
  const boxes: [string, { name: string; pct: number }][] = [['Strongest area', r.best], ['Area to work on', r.weak]];
  boxes.forEach(([label, c], i) => {
    const x = M + i * (boxW + 14);
    page.drawRectangle({ x, y: y - 44, width: boxW, height: 44, color: C.alt });
    page.drawText(label, { x: x + 12, y: y - 16, size: 9, font: sans, color: C.slate });
    page.drawText(`${safe(bold, c.name)}  ${c.pct}%`, { x: x + 12, y: y - 33, size: 11.5, font: bold, color: C.navy });
  });
  y -= 70;

  // Tips for the weakest area
  page.drawText(safe(serif, `Tips for ${r.weak.name.toLowerCase()}`), { x: M, y, size: 15, font: serif, color: C.navy });
  y -= 20;
  for (const t of r.weak.tips) {
    page.drawCircle({ x: M + 4, y: y + 3.5, size: 2, color: C.teal });
    y = para(page, t.text, M + 14, y, { size: 10.5, maxW: W - 2 * M - 14 });
    if (t.href) y = para(page, `${t.linkText ?? 'Source'}: ${t.href}`, M + 14, y, { size: 8.5, color: C.slate, maxW: W - 2 * M - 14, lead: 11 });
    y -= 5;
  }

  // Next step
  y -= 8;
  const ctaLines = wrap(sans, 10.5, r.ctaText, W - 2 * M - 28);
  const boxH = 46 + ctaLines.length * 14.5;
  page.drawRectangle({ x: M, y: y - boxH + 14, width: W - 2 * M, height: boxH, borderColor: C.border, borderWidth: 1 });
  page.drawText(safe(serif, r.ctaTitle), { x: M + 14, y: y - 8, size: 14, font: serif, color: C.navy });
  let cy = y - 26;
  for (const l of ctaLines) { page.drawText(l, { x: M + 14, y: cy, size: 10.5, font: sans, color: C.text }); cy -= 14.5; }
  page.drawText('Book a call: heartcadence.com/book-a-call', { x: M + 14, y: cy - 2, size: 10.5, font: bold, color: C.copper });

  // Footer
  page.drawLine({ start: { x: M, y: 50 }, end: { x: W - M, y: 50 }, thickness: 0.75, color: C.border });
  page.drawText(safe(sans, `Based on your answers to the ${r.sc.cardTitle.toLowerCase()} at heartcadence.com/scorecards/${r.sc.slug}/`), { x: M, y: 36, size: 8, font: sans, color: C.slate });
  page.drawText('Heart Cadence Inc.  |  Brantford, Ontario  |  heartcadence.com', { x: M, y: 24, size: 8, font: sans, color: C.slate });

  return doc.save();
}

export function toBase64(bytes: Uint8Array) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function pdfFileName(sc: Scorecard, company: string) {
  const part = (v: string) => v.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `HCI-${part(sc.cardTitle)}${company ? `-${part(company)}` : ''}.pdf`;
}
