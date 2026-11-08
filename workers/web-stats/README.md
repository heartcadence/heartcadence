# hci-web-stats

A small Cloudflare Worker for the monthly heartcadence.com visitor report.

- On the 1st of each month (06:00 UTC), it reads last month's numbers from Cloudflare
  Web Analytics and saves them to the D1 database `hci-web-stats`, table `monthly_stats`.
- A Claude scheduled task reads that row later the same morning and emails the report
  to jmcewan@heartcadence.com.
- It has no public address and does not change the website.

This folder is separate from the website. The Cloudflare Pages build ignores it.

## What it saves

Visits and page views, top pages, top referrers, countries, device types, visits per
day, and page speed (Core Web Vitals, 75th percentile) when available. Bot traffic is
excluded when the API allows it. Any problems are saved in the `errors` column.

## Secrets

Set with `npx wrangler secret put NAME`. Never commit them or paste them in chat.

| Name | Value |
| --- | --- |
| `CF_API_TOKEN` | API token with one permission: Account > Account Analytics > Read |
| `ACCOUNT_ID` | Cloudflare account ID |
| `SITE_TAG` | Web Analytics site tag for heartcadence.com |

## Deploy (from a GitHub Codespace)

```
cd workers/web-stats
export CLOUDFLARE_API_TOKEN=...   # deploy token: Workers Scripts Edit, D1 Edit
npx wrangler deploy
npx wrangler secret put CF_API_TOKEN
npx wrangler secret put ACCOUNT_ID
npx wrangler secret put SITE_TAG
```

## Test run

Saves the current month so far as a row named `YYYY-MM-test`.

```
cp .dev.vars.example .dev.vars    # fill in the three values; this file is never committed
npx wrangler dev --remote --test-scheduled
# in a second terminal:
curl "http://localhost:8787/__scheduled?cron=test"
```

Then delete `.dev.vars`.

## Check the saved data

```
npx wrangler d1 execute hci-web-stats --remote --command "SELECT month, errors, created_at FROM monthly_stats"
```
