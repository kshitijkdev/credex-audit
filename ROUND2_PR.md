## What this PR does
Adds a "re-audit on pricing change" system: audits are now persisted with the
pricing snapshot used at generation time, a `/api/detect-changes` endpoint
finds audits whose pricing has since changed, and affected users receive a
consolidated email with a link to a diff view showing old vs new recommendations.

## Why
A one-time audit that goes stale is worse than no audit — if Cursor raises
prices and the audit still says "you're optimal", the tool actively misleads
the user. This feature makes audits self-correcting.

## How it works
1. On audit save, `OFFICIAL_PRICING`, the full `AuditResult`, and the user's
   email are now persisted to Supabase alongside existing fields.
2. `POST /api/detect-changes` (protected by `DETECT_CHANGES_SECRET`) scans all
   non-stale audits, diffs stored `pricing_snapshot` against current
   `OFFICIAL_PRICING`, re-runs the audit engine, and checks if recommendations
   changed. If yes, marks rows `is_stale=true` and sends one consolidated
   email per user via Resend.
3. A GitHub Actions cron triggers the endpoint daily at 9 AM UTC. The same
   endpoint accepts a manual POST for testing.
4. `/reaudit/[id]` fetches the stored audit, re-runs with current pricing
   server-side, and renders an old-vs-new diff view with changed rows
   highlighted and a savings delta headline.

New code lives in: `app/api/detect-changes/route.ts`,
`app/reaudit/[id]/page.tsx`. Modified: `app/api/audit/route.ts`,
`lib/auditEngine.ts` (added optional `pricingOverride` param).
Schema: `ALTER TABLE audits ADD COLUMN` (user_email, pricing_snapshot,
output_result, is_stale, stale_detected_at).

## What I cut
- **One-click unsubscribe link in emails.** Value is clear but implementing a
  token-based unsubscribe endpoint + storing opt-out state would have cost
  ~3 hours and was lower priority than getting the core flow working end-to-end.
  Next step after this PR.
- **Admin dashboard** (total audits, emails sent, click-through). Cut for time —
  the data is all in Supabase and readable directly for now.
- **"What changed this week" public page.** Interesting growth surface but
  requires a separate UI and adds no value to the core re-audit flow.
- **Automated tests for detect-changes.** Skipped due to time — would test:
  (a) detectPricingChanges returns empty array on identical snapshots,
  (b) stale flag set correctly, (c) one email per user with 3 affected audits.

## How to test it manually
1. Run an audit at the live URL, enter your email, save it.
2. In Supabase SQL editor, update the saved audit's `pricing_snapshot` to
   simulate a price change:
```sql
   UPDATE audits SET pricing_snapshot = jsonb_set(
     pricing_snapshot, '{cursor,Pro}', '15'
   ) WHERE user_email = 'your@email.com';
```
3. Trigger detection:
POST /api/detect-changes  { "secret": "<DETECT_CHANGES_SECRET>" }
4. Check your inbox for the re-audit email → click the link → confirm diff
   view shows old vs new recommendations with the changed tool highlighted.

## What's tested
Manually verified end-to-end: audit save → pricing snapshot stored → detect-
changes flags stale row → email delivered via Resend → diff view renders
correctly. No automated tests in this PR (see What I cut).

## Open questions / risks
- `runAudit` is called server-side in `detect-changes` — it's pure sync JS
  so this is fine, but if the engine ever becomes async this route needs updating.
- Email deliverability from `notifications@credex.rocks` depends on Resend
  domain verification being active. If the domain isn't verified, Resend will
  reject sends silently — worth confirming before demo.