// hci-web-stats
// Once a month, reads last month's heartcadence.com numbers from Cloudflare
// Web Analytics (GraphQL Analytics API) and saves them to the D1 database
// "hci-web-stats", table monthly_stats. A Claude scheduled task then reads
// that row and emails the report.
//
// Secrets (set with `npx wrangler secret put NAME`, never committed):
//   CF_API_TOKEN  API token with Account > Account Analytics > Read
//   ACCOUNT_ID    Cloudflare account ID
//   SITE_TAG      Web Analytics site tag for heartcadence.com

const GQL_URL = 'https://api.cloudflare.com/client/v4/graphql';

const BREAKDOWNS = {
  pages: 'requestPath',
  referrers: 'refererHost',
  countries: 'countryName',
  devices: 'deviceType',
};

// Month boundaries are in UTC.
function previousMonth(now) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 1, 1));
  return { month: start.toISOString().slice(0, 7), start, end };
}

// Used only for a test run: the current month so far.
function monthToDate(now) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return { month: start.toISOString().slice(0, 7) + '-test', start, end: now };
}

async function gql(env, query, variables) {
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.errors?.length) {
    const msg = body.errors?.map((e) => e.message).join('; ') || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body.data.viewer.accounts[0];
}

function pageloadQuery({ dimension, limit, orderBy, excludeBots }) {
  const bot = excludeBots ? ', { bot: 0 }' : '';
  const dims = dimension ? `dimensions { value: ${dimension} }` : '';
  return `query ($accountTag: string!, $siteTag: string!, $start: Time!, $end: Time!) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        rows: rumPageloadEventsAdaptiveGroups(
          filter: { AND: [{ siteTag: $siteTag }, { datetime_geq: $start }, { datetime_lt: $end }${bot}] }
          limit: ${limit}
          ${orderBy ? `orderBy: [${orderBy}]` : ''}
        ) {
          count
          sum { visits }
          ${dims}
        }
      }
    }
  }`;
}

async function runPageload(env, vars, opts, errors, label) {
  // Try with bots excluded first. If the API rejects that filter, retry without it.
  try {
    return { rows: (await gql(env, pageloadQuery({ ...opts, excludeBots: true }), vars)).rows, botsExcluded: true };
  } catch (e1) {
    try {
      const rows = (await gql(env, pageloadQuery({ ...opts, excludeBots: false }), vars)).rows;
      errors.push(`${label}: bot filter not accepted, bots included (${e1.message})`);
      return { rows, botsExcluded: false };
    } catch (e2) {
      errors.push(`${label}: ${e2.message}`);
      return { rows: [], botsExcluded: null };
    }
  }
}

async function webVitals(env, vars, errors) {
  const query = `query ($accountTag: string!, $siteTag: string!, $start: Time!, $end: Time!) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        rows: rumWebVitalsEventsAdaptiveGroups(
          filter: { AND: [{ siteTag: $siteTag }, { datetime_geq: $start }, { datetime_lt: $end }] }
          limit: 1
        ) {
          count
          quantiles {
            largestContentfulPaintP75
            interactionToNextPaintP75
            cumulativeLayoutShiftP75
          }
        }
      }
    }
  }`;
  try {
    const rows = (await gql(env, query, vars)).rows;
    return rows[0]?.quantiles ?? null;
  } catch (e) {
    errors.push(`webVitals: ${e.message}`);
    return null;
  }
}

async function collect(env, period) {
  const errors = [];
  for (const key of ['CF_API_TOKEN', 'ACCOUNT_ID', 'SITE_TAG']) {
    if (!env[key]) errors.push(`Missing secret ${key}`);
  }
  const vars = {
    accountTag: env.ACCOUNT_ID,
    siteTag: env.SITE_TAG,
    start: period.start.toISOString(),
    end: period.end.toISOString(),
  };

  const data = { site: 'heartcadence.com', month: period.month };

  if (!errors.length) {
    const totals = await runPageload(env, vars, { limit: 1 }, errors, 'totals');
    data.totals = {
      visits: totals.rows[0]?.sum?.visits ?? 0,
      pageViews: totals.rows[0]?.count ?? 0,
    };
    data.botsExcluded = totals.botsExcluded;

    for (const [name, dimension] of Object.entries(BREAKDOWNS)) {
      const r = await runPageload(env, vars, { dimension, limit: 15, orderBy: 'count_DESC' }, errors, name);
      data[name] = r.rows.map((row) => ({
        value: row.dimensions?.value || '(none)',
        visits: row.sum?.visits ?? 0,
        pageViews: row.count ?? 0,
      }));
    }

    const daily = await runPageload(env, vars, { dimension: 'date', limit: 62, orderBy: 'date_ASC' }, errors, 'daily');
    data.daily = daily.rows.map((row) => ({
      date: row.dimensions?.value,
      visits: row.sum?.visits ?? 0,
      pageViews: row.count ?? 0,
    }));

    data.webVitalsP75 = await webVitals(env, vars, errors);
  }

  await env.DB.prepare(
    `INSERT INTO monthly_stats (month, period_start, period_end, data, errors, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP)
     ON CONFLICT(month) DO UPDATE SET period_start = ?2, period_end = ?3, data = ?4, errors = ?5, created_at = CURRENT_TIMESTAMP`
  )
    .bind(period.month, vars.start, vars.end, JSON.stringify(data), JSON.stringify(errors))
    .run();

  return { data, errors };
}

export default {
  // Monthly run (cron in wrangler.toml). A test run with cron "test" saves
  // the current month so far as "YYYY-MM-test".
  async scheduled(controller, env, ctx) {
    const now = new Date(controller.scheduledTime || Date.now());
    const period = controller.cron === 'test' ? monthToDate(now) : previousMonth(now);
    ctx.waitUntil(collect(env, period));
  },

  // No public pages.
  async fetch() {
    return new Response('Not found', { status: 404 });
  },
};
