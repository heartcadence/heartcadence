"""Add lifetime totals to this week's data.

Usage: python3 combine.py log_rows.json week.json data.json
log_rows.json: the rows of the "heartcadence.com weekly analytics log" sheet (A1:J), header first,
  NOT including this week's row. Columns: start, end, type, visits, page views,
  referers JSON, pages JSON, countries JSON, devices JSON, notes.
week.json: this week's data in the make_charts.py format.
Writes data.json = week data plus a "lifetime" block (all logged rows plus this week).
"""
import json, sys
from collections import Counter

def merge(lists):
    c = Counter()
    for rows in lists:
        for name, n in rows:
            c[name] += n
    return [[k, v] for k, v in c.most_common()]

def main():
    rows = json.load(open(sys.argv[1]))[1:]
    week = json.load(open(sys.argv[2]))
    parse = lambda s: json.loads(s) if s else []
    visits = sum(int(float(r[3] or 0)) for r in rows) + week["visits"]
    views = sum(int(float(r[4] or 0)) for r in rows) + week["pageViews"]
    def label(r):
        import datetime as _dt
        if r[2] == "baseline":
            return "Before " + _dt.date.fromisoformat(r[1][:10]).strftime("%b %-d")
        return _dt.date.fromisoformat(r[0][:10]).strftime("%b %-d")
    weeks = [[label(r), int(float(r[3] or 0)), int(float(r[4] or 0))] for r in rows]
    weeks.append([week.get("weekLabel", "This week"), week["visits"], week["pageViews"]])
    start = rows[0][0][:10] if rows else week.get("start", "")
    week["lifetime"] = {
        "since": start,
        "visits": visits,
        "pageViews": views,
        "weeks": weeks,
        "referers": merge([parse(r[5]) for r in rows] + [week.get("referers", [])]),
        "pages": merge([parse(r[6]) for r in rows] + [week.get("pages", [])]),
        "countries": merge([parse(r[7]) for r in rows] + [week.get("countries", [])]),
        "devices": merge([parse(r[8]) for r in rows] + [week.get("devices", [])]),
        "estimated": any(r[2] == "baseline" for r in rows),
    }
    json.dump(week, open(sys.argv[3], "w"))

if __name__ == "__main__":
    main()
