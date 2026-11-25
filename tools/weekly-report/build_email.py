"""Build the HTML email for the heartcadence.com analytics report.

Usage: python3 build_email.py data.json chartdir out.html
data.json is the same file make_charts.py uses, plus optional:
  "previous": {"visits": 40, "pageViews": 70}   # week before, for change arrows
  "notes": ["..."]                              # extra notes
Charts are referenced as cid:att0, cid:att1, ... in the order the PNG files sort,
so attach them to the email in that same order, all marked inline.
"""
import json, os, sys, html

NAVY, SLATE, COPPER, TEAL, OFF = "#0F2A44", "#3B5B7A", "#B4472F", "#2F7D79", "#F7F5F1"

def change(cur, prev):
    if prev in (None, 0):
        return ""
    d = cur - prev
    pct = round(d * 100 / prev)
    arrow = "&#9650;" if d > 0 else ("&#9660;" if d < 0 else "&#8211;")
    return f'<div style="font-size:12px;opacity:.9">{arrow} {d:+,} ({pct:+}%) vs last week</div>'

def since_label(d):
    import datetime as _dt
    try:
        return _dt.date.fromisoformat(d[:10]).strftime("%b %-d, %Y")
    except ValueError:
        return d

def nice_page(p):
    return "Home" if p == "/" else p.strip("/").split("/")[-1].replace("-", " ").capitalize()

def tile(label, value, colour, extra=""):
    return (f'<td width="25%" style="padding:6px"><div style="background:{colour};color:#FFFFFF;'
            f'border-radius:8px;padding:14px 12px;font-family:Arial,sans-serif">'
            f'<div style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;opacity:.9">{label}</div>'
            f'<div style="font-size:28px;font-weight:bold;margin-top:4px">{value}</div>{extra}</div></td>')

def main():
    data = json.load(open(sys.argv[1]))
    charts = sorted(f for f in os.listdir(sys.argv[2]) if f.endswith(".png"))
    prev = data.get("previous") or {}
    tiles = "".join([
        tile("Visits", f'{data["visits"]:,}', NAVY, change(data["visits"], prev.get("visits"))),
        tile("Page views", f'{data["pageViews"]:,}', TEAL, change(data["pageViews"], prev.get("pageViews"))),
        tile("Load time", f'{data.get("loadMs", "n/a")} ms' if data.get("loadMs") is not None else "n/a", COPPER),
        tile("Fast loads", f'{data.get("lcpGoodPct", "n/a")}%' if data.get("lcpGoodPct") is not None else "n/a", SLATE),
    ])
    def img(name):
        i = charts.index(name)
        alt = html.escape(name[2:-4].replace("-", " "))
        return (f'<tr><td style="padding:10px 0"><img src="cid:att{i}" width="600" '
                f'style="width:100%;max-width:600px;height:auto;display:block" alt="{alt} chart"></td></tr>')
    week_imgs = "".join(img(c) for c in charts if not c[2:].startswith("life"))
    life_imgs = "".join(img(c) for c in charts if c[2:].startswith("life"))
    life = data.get("lifetime")
    life_block = ""
    if life:
        life_tiles = "".join([
            tile("Visits", f'{life["visits"]:,}', NAVY),
            tile("Page views", f'{life["pageViews"]:,}', TEAL),
            tile("Weeks", f'{len(life.get("weeks", []))}', COPPER),
            tile("Top page", html.escape(nice_page(life["pages"][0][0])) if life.get("pages") else "n/a", SLATE),
        ])
        est = ('<div style="font-size:12px;color:#3B5B7A;padding:0 6px">Includes an estimate for traffic before weekly '
               'reports began (Cloudflare samples older data).</div>') if life.get("estimated") else ""
        life_block = (f'<tr><td style="padding:18px 24px 0"><div style="font-size:18px;font-weight:bold;color:{NAVY}">'
                      f'All time, since {html.escape(since_label(life.get("since", "")))}</div>'
                      f'<div style="height:3px;width:60px;background:{TEAL};margin-top:6px;border-radius:2px"></div></td></tr>'
                      f'<tr><td style="padding:10px 18px 4px"><table width="100%" cellpadding="0" cellspacing="0"><tr>{life_tiles}</tr></table>{est}</td></tr>'
                      f'<tr><td style="padding:0 20px"><table width="100%" cellpadding="0" cellspacing="0">{life_imgs}</table></td></tr>')
    notes = "".join(f"<li>{html.escape(n)}</li>" for n in data.get("notes", []))
    out = f'''<div style="background:{OFF};padding:20px 0">
<table align="center" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border-radius:10px;font-family:Arial,sans-serif;color:#1E2329">
<tr><td style="background:{NAVY};color:#FFFFFF;padding:22px 24px;border-radius:10px 10px 0 0">
<div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#F2C7BC">Heart Cadence Inc.</div>
<div style="font-size:22px;font-weight:bold;margin-top:4px">heartcadence.com analytics</div>
<div style="font-size:14px;margin-top:4px;opacity:.9">{html.escape(data["title"])}</div>
<div style="height:4px;width:80px;background:{COPPER};margin-top:12px;border-radius:2px"></div>
</td></tr>
<tr><td style="padding:18px 24px 0"><div style="font-size:18px;font-weight:bold;color:{NAVY}">{html.escape(data.get("sectionTitle", "Last 7 days"))}</div>
<div style="height:3px;width:60px;background:{COPPER};margin-top:6px;border-radius:2px"></div></td></tr>
<tr><td style="padding:10px 18px 4px"><table width="100%" cellpadding="0" cellspacing="0"><tr>{tiles}</tr></table></td></tr>
<tr><td style="padding:0 20px"><table width="100%" cellpadding="0" cellspacing="0">{week_imgs}</table></td></tr>
{life_block}
<tr><td style="padding:8px 24px 20px;font-size:13px;color:#3B5B7A">
<div style="font-weight:bold;color:{NAVY};margin-bottom:4px">Notes</div>
<ul style="margin:0;padding-left:18px">{notes}
<li>Fast loads is the share of page loads with a good Largest Contentful Paint (Core Web Vitals).</li>
<li>Calls booked are not tracked here. Compare with your calendar.</li></ul>
<div style="margin-top:12px">Source: Cloudflare Web Analytics. Full detail in the Cloudflare dashboard under Analytics &gt; Web analytics.</div>
</td></tr></table></div>'''
    open(sys.argv[3], "w").write(out)
    print("\n".join(charts))

if __name__ == "__main__":
    main()
