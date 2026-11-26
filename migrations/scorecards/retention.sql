-- Retention clean-up (privacy policy, KB-167). Same rules as cleanUp() in functions/api/scorecard.ts.
-- Run monthly against hci-scorecards and hci-scorecards-dev as a backstop.
DELETE FROM submissions WHERE created_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-24 months');
UPDATE submissions SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND created_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days');
