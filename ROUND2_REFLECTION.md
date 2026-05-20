## 1. Most uncomfortable trade-off under time pressure
I skipped one-click unsubscribe in emails. The trade-off isn't aesthetic — it's
legal and ethical. Sending re-audit emails without an unsubscribe mechanism is
technically a CAN-SPAM violation. I made a conscious call that the core flow
(detect → email → diff view) needed to work end-to-end before adding compliance
features, and that a missing unsubscribe is fixable in the next PR while a
broken email flow is a failed submission. The discomfort is that I'm shipping
something I know is technically non-compliant, even if only one real email
address is in the test database.

## 2. First thing with 24 more hours
Add the unsubscribe link. The mechanism is: generate a signed token
(HMAC of audit ID + email + secret), append to email as `/unsubscribe?token=...`,
create a GET handler that validates the token and inserts a row into an
`email_opt_outs` table, and check that table in detect-changes before sending.
This is ~2 hours of focused work. I'd do it first because it unblocks actually
using the email feature in production without legal risk.

## 3. One thing my Round 1 self made harder for Round 2
The `audits` table schema in Round 1 saved `monthly_savings` and `annual_savings`
as flat numbers rather than saving the full `AuditResult` as a JSONB blob. This
meant there was no stored per-tool breakdown — just the totals. For the diff view,
I needed per-tool results to show what changed. I had to add `output_result JSONB`
in Round 2 and update the insert. Had Round 1 stored the full result from the
start, the diff view would have been trivial. The lesson: when in doubt, store
more. Disk is cheap; ALTER TABLE under deadline pressure is not.