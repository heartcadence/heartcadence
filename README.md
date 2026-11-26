# heartcadence.com

The website for Heart Cadence Inc. Built with Astro and Tailwind CSS, hosted on Cloudflare Pages.

## Run it on your computer

You need Node.js 22.22 or newer.

```
npm install
npm run dev
```

Then open http://localhost:4321.

## Settings

Copy `.env.example` to `.env` and fill in:

- `PUBLIC_BOOKING_URL`: the booking page link from your Google Calendar appointment schedule. Until it is set, the Book a call page asks visitors to email instead.

Company facts (email, PBN, location) live in `src/site.ts`. Change them there, not on each page.

## Deploy to Cloudflare Pages

1. Put this folder in a GitHub repository.
2. In Cloudflare, go to Workers and Pages, then Create, then Pages, then connect the repository.
3. Framework preset: Astro. Build command: `npm run build`. Output folder: `dist`.
4. Add `PUBLIC_BOOKING_URL` under Settings, then Environment variables.
5. Add the custom domain heartcadence.com.

## Where things are

| Path | What |
| --- | --- |
| `src/pages/` | One file per page. `fr/index.astro` is the French summary. |
| `src/styles/theme.css` | Colours for light and dark mode, fonts, buttons. |
| `src/components/` | Header, footer, theme toggle, shared blocks. |
| `public/` | Logos and favicons. |

## Brand rules for copy

No em-dashes. No exclamation marks. No "unlock," "seamless," "leverage," or "empower." Never promise wins or suggest government connections. Never publish pricing or success-fee language until a lawyer has reviewed it.

## Scorecards

Pages at `/scorecards/<slug>/`. Content: `src/data/scorecards.ts`. Engine: `src/scripts/scorecard.ts`.
Submissions go to `functions/api/scorecard.ts` (a Cloudflare Pages Function), which saves them to D1
and emails a lead notice through the Gmail API.

D1 databases (schema in `migrations/scorecards/`): `hci-scorecards` for Production, `hci-scorecards-dev` for Preview.

Cloudflare Pages settings (set Production and Preview separately):

| Name | Type | Value |
| --- | --- | --- |
| `DB` | D1 binding | `hci-scorecards` (Production) or `hci-scorecards-dev` (Preview) |
| `GMAIL_CLIENT_ID` | Secret | Google OAuth client ID |
| `GMAIL_CLIENT_SECRET` | Secret | Google OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | Secret | Refresh token for the sending mailbox, scope `https://www.googleapis.com/auth/gmail.send` |
| `GMAIL_SENDER` | Variable | The mailbox that sends the notice |
| `NOTIFY_TO` | Variable | Where lead notices go |

If the Gmail settings are missing, submissions are still saved, with `emailed = 0` and the reason in `email_error`.
Scorecard pages are `noindex` and left out of the sitemap until launch (KB-165).
