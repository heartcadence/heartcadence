"""Build the charts for the heartcadence.com analytics email.

Usage: python3 make_charts.py data.json outdir
data.json example:
{
  "title": "Nov 5 to Nov 24, 2026",
  "visits": 50, "pageViews": 90, "loadMs": 234, "lcpGoodPct": 100,
  "daily": [["2026-11-17", 4, 7], ...],          # optional: date, visits, page views
  "referers": [["None (direct)", 30], ["www.google.com", 10]],
  "pages": [["/", 50], ["/services/", 40]],
  "countries": [["Canada", 40], ["United States", 10]],
  "devices": [["Desktop", 40], ["Mobile", 10]]
}
Writes PNG files to outdir and prints their names.
"""
import json, os, sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator

NAVY, SLATE, COPPER, TEAL, INK, MUTED, GRID = "#0F2A44", "#3B5B7A", "#B4472F", "#2F7D79", "#1E2329", "#5B6B7A", "#E6E1D8"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 11, "text.color": INK,
                     "axes.labelcolor": MUTED, "xtick.color": MUTED, "ytick.color": INK})

def style(ax):
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    ax.spines["bottom"].set_color(GRID)
    ax.tick_params(length=0)
    ax.grid(axis="x", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)

FRIENDLY = {"None (direct)": "Direct", "(none)": "Direct", "/": "Home", "www.google.com": "Google",
            "www.linkedin.com": "LinkedIn", "linkedin.com": "LinkedIn", "com.linkedin.android": "LinkedIn app", "www.bing.com": "Bing"}

def nice(v):
    if v in FRIENDLY:
        return FRIENDLY[v]
    if v.startswith("/"):
        return v.strip("/").split("/")[-1].replace("-", " ").capitalize() or "Home"
    return v.removeprefix("www.")

def hbar(rows, colour, title, path, label="Visits"):
    rows = [r for r in rows if r[1] > 0][:8]
    if not rows:
        return None
    names = [nice(r[0]) for r in rows][::-1]
    vals = [r[1] for r in rows][::-1]
    fig, ax = plt.subplots(figsize=(6.4, 0.55 * len(rows) + 1.1), dpi=150)
    bars = ax.barh(names, vals, color=colour, height=0.6)
    for b, v in zip(bars, vals):
        ax.text(b.get_width() + max(vals) * 0.02, b.get_y() + b.get_height() / 2, f"{v:,}",
                va="center", fontsize=10, color=INK)
    ax.set_xlim(0, max(vals) * 1.15)
    ax.xaxis.set_major_locator(MaxNLocator(integer=True))
    ax.set_xlabel(label)
    ax.set_title(title, loc="left", fontsize=13, fontweight="bold", color=NAVY, pad=10)
    style(ax)
    fig.tight_layout()
    fig.savefig(path, facecolor="white")
    plt.close(fig)
    return path

def trend(daily, path):
    if not daily or len(daily) < 2:
        return None
    import datetime as _dt
    dates = [_dt.date.fromisoformat(d[0]).strftime("%b %-d") for d in daily]
    visits = [d[1] for d in daily]
    views = [d[2] for d in daily]
    fig, ax = plt.subplots(figsize=(6.4, 2.8), dpi=150)
    ax.plot(dates, views, color=TEAL, linewidth=2, marker="o", markersize=4, label="Page views")
    ax.plot(dates, visits, color=COPPER, linewidth=2, marker="o", markersize=4, label="Visits")
    ax.fill_between(range(len(dates)), views, color=TEAL, alpha=0.12)
    ax.set_title("Daily traffic, last 7 days", loc="left", fontsize=13, fontweight="bold", color=NAVY, pad=10)
    ax.legend(frameon=False, loc="lower right", bbox_to_anchor=(1, 1.0), ncol=2, fontsize=10)
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    ax.spines["left"].set_color(GRID); ax.spines["bottom"].set_color(GRID)
    ax.grid(axis="y", color=GRID, linewidth=0.8); ax.set_axisbelow(True)
    ax.tick_params(length=0)
    step = max(1, -(-len(dates) // 6))
    ax.set_xticks(range(0, len(dates), step)); ax.set_xticklabels(dates[::step])
    ax.set_ylim(bottom=0)
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    fig.tight_layout()
    fig.savefig(path, facecolor="white")
    plt.close(fig)
    return path

def weeks_chart(weeks, path):
    if not weeks:
        return None
    labels = [w[0] for w in weeks]
    visits = [w[1] for w in weeks]
    views = [w[2] for w in weeks]
    x = range(len(labels))
    fig, ax = plt.subplots(figsize=(6.4, 2.9), dpi=150)
    wdt = 0.38
    ax.bar([i - wdt / 2 - 0.01 for i in x], views, wdt, color=TEAL, label="Page views")
    ax.bar([i + wdt / 2 + 0.01 for i in x], visits, wdt, color=COPPER, label="Visits")
    for i in x:
        ax.text(i - wdt / 2, views[i], f"{views[i]:,}", ha="center", va="bottom", fontsize=9)
        ax.text(i + wdt / 2, visits[i], f"{visits[i]:,}", ha="center", va="bottom", fontsize=9)
    ax.set_xticks(list(x)); ax.set_xticklabels(labels)
    ax.set_title("Traffic by week since launch", loc="left", fontsize=13, fontweight="bold", color=NAVY, pad=10)
    ax.legend(frameon=False, loc="lower right", bbox_to_anchor=(1, 1.0), ncol=2, fontsize=10)
    for sp in ("top", "right", "left"):
        ax.spines[sp].set_visible(False)
    ax.spines["bottom"].set_color(GRID)
    ax.grid(axis="y", color=GRID, linewidth=0.8); ax.set_axisbelow(True); ax.tick_params(length=0)
    ax.set_ylim(0, max(views + visits + [1]) * 1.18)
    fig.tight_layout(); fig.savefig(path, facecolor="white"); plt.close(fig)
    return path

def main():
    data = json.load(open(sys.argv[1]))
    out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    made = [
        trend(data.get("daily"), os.path.join(out, "1-trend.png")),
        hbar(data.get("referers", []), COPPER, "Where visitors came from, last 7 days", os.path.join(out, "2-sources.png")),
        hbar(data.get("pages", []), TEAL, "Top pages, last 7 days", os.path.join(out, "3-pages.png"), "Page views"),
        hbar(data.get("countries", []), NAVY, "Countries, last 7 days", os.path.join(out, "4-countries.png")),
        hbar(data.get("devices", []), SLATE, "Devices, last 7 days", os.path.join(out, "5-devices.png")),
    ]
    life = data.get("lifetime")
    if life:
        made += [
            weeks_chart(life.get("weeks"), os.path.join(out, "6-life-weeks.png")),
            hbar(life.get("referers", []), COPPER, "Where visitors came from, all time", os.path.join(out, "7-life-sources.png")),
            hbar(life.get("pages", []), TEAL, "Top pages, all time", os.path.join(out, "8-life-pages.png"), "Page views"),
        ]
    for m in made:
        if m:
            print(m)

if __name__ == "__main__":
    main()
