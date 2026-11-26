// Speedometer gauge for the scorecards. Used on the server (landing sample) and in the browser (results).
// Zones match the band starts in src/data/scorecards.ts: 0 to 49, 50 to 79, 80 to 100.

const pt = (p: number, r = 80) => [100 - r * Math.cos(Math.PI * p), 100 - r * Math.sin(Math.PI * p)];
const arc = (a: number, b: number) => {
  const [x1, y1] = pt(a);
  const [x2, y2] = pt(b);
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A80 80 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

export function gaugeSvg(label = 'Score gauge'): string {
  const zones: [number, number, string][] = [
    [0, 0.495, 'var(--link)'],
    [0.505, 0.795, 'var(--text-muted)'],
    [0.805, 1, 'var(--accent)'],
  ];
  const ticks = [0, 0.25, 0.5, 0.75, 1]
    .map((p) => {
      const [x1, y1] = pt(p, 62);
      const [x2, y2] = pt(p, 56);
      return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="var(--text-muted)" stroke-width="1.5"/>`;
    })
    .join('');
  return `<svg class="sc-gauge" viewBox="0 0 200 112" role="img" aria-label="${label}">
<path d="${arc(0, 1)}" fill="none" stroke="var(--border)" stroke-width="18"/>
${zones.map(([a, b, c]) => `<path d="${arc(a, b)}" fill="none" stroke="${c}" stroke-width="18"/>`).join('')}
${ticks}
<g class="sc-needle"><path d="M100 30 L104 100 L96 100Z" fill="var(--heading)"/></g>
<circle cx="100" cy="100" r="8" fill="var(--heading)"/><circle cx="100" cy="100" r="3" fill="var(--surface)"/>
</svg>`;
}

export function setNeedle(root: ParentNode, pct: number) {
  const n = root.querySelector<SVGGElement>('.sc-needle');
  if (!n) return;
  requestAnimationFrame(() => requestAnimationFrame(() => { n.style.transform = `rotate(${(pct / 100) * 180 - 90}deg)`; }));
}
