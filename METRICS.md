# Metrics

## North Star Metric

**Audits completed per week**

This is the single metric that drives everything else. An "audit completed" means a user
filled the form and saw their results — they got value from the product. It's the moment
Credex's lead-gen purpose and the user's genuine need intersect.

Why not "leads captured"? Because email capture happens after value is shown — optimizing
for leads before audits would push us toward dark patterns (email gate before results).
Why not "site visits"? Traffic without completion is vanity — a viral tweet could drive
1,000 visits with 0 audits if the form is confusing.

At this stage (pre-revenue, pre-product-market-fit), audits completed is the truest signal
that the product is working.

## 3 Input Metrics That Drive the North Star

**1. Audit start rate (visitors → form started)**
If people land and don't start the form, the hero copy or UX is failing.
Target: >40% of visitors start the form.

**2. Form completion rate (form started → audit submitted)**
If people start but don't finish, the form is too long or confusing.
Target: >60% of starters complete the audit.

**3. Shareability rate (audits completed → result URL shared)**
The shareable URL is the viral loop. If nobody shares, growth is purely paid/earned.
Target: >5% of completers share their result URL.

## What to Instrument First

1. **Page load → form interaction** — did the user check at least one tool checkbox?
2. **Form started → audit submitted** — drop-off point in the form
3. **Audit page load → email submitted** — lead capture conversion rate
4. **Email submitted → shareable URL copied** — viral loop activation
5. **Shared URL visits** — how much traffic comes from shared results

Simple implementation: a `POST /api/events` route logging `{event, timestamp, sessionId}`
to Supabase. No third-party analytics needed at this stage — keeps it privacy-friendly
and aligns with the product's privacy-first positioning.

## What Number Triggers a Pivot Decision

**If audit completion rate drops below 15% after 500 visits:**
The form is too complicated or the value proposition isn't landing. Pivot: simplify to
3 tools max on first load, add progressive disclosure for the rest.

**If email capture rate stays below 10% after 200 completed audits:**
Users are getting value but not trusting us with their email. Pivot: A/B test showing
a sample result before asking for email, or reduce fields to email-only.

**If zero shareable URLs are shared after 100 audits:**
The viral loop is broken. Pivot: add a pre-written tweet template on the results page,
or add a "compare with your team" feature to incentivize sharing.

**If >80% of audits show "You're spending well":**
The audit engine is too lenient or the wrong users are finding the tool. Pivot: tighten
the overspend detection thresholds or retarget distribution to higher-spend teams.