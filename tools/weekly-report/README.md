# Weekly analytics email

Used by the Claude scheduled task "HCI weekly website analytics report" (Mondays, Toronto time).
Not part of the website build.

1. The task reads last week's numbers from Cloudflare Web Analytics and writes `data.json`
   (format at the top of `make_charts.py`).
2. `python3 make_charts.py data.json charts` makes the PNG charts (brand colours).
3. `python3 build_email.py data.json charts email.html` builds the HTML email. Charts are
   referenced as `cid:att0`, `cid:att1`, ... in file-name order, so attach them inline in that order.
