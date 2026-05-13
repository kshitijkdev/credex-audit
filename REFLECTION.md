# Reflection

## 1. The Hardest Bug

The hardest bug was the audit engine's flag logic silently overriding correct results.
After building the core engine, I wrote tests and discovered two were failing —
the ChatGPT Team plan overkill test and the Anthropic API overlap test were both
returning `credits` instead of `overpaying` and `redundant` respectively.

My first hypothesis was that the plan-fit logic wasn't running at all — I added
console logs and confirmed it was running correctly and setting the right flag. So
the flag was being set correctly, then changed somewhere downstream.

I traced the execution order and found the culprit: a block at the bottom of the
loop that read `if (currentSpend >= 50 && result.flag !== "optimal") { flag = "credits" }`.
This was meant to surface the Credex credits opportunity for high-spend users, but
it was overriding every non-optimal flag — including `overpaying` and `redundant` —
for any tool with spend over $50.

The fix was simple once I found it: change the condition to only apply `credits`
when the flag was already `optimal`, not for all non-optimal cases. The lesson was
that flag priority logic needs to be explicit — "not optimal" and "already well-flagged"
are very different conditions. Writing tests before the feature was complete would
have caught this immediately instead of after the fact.

## 2. A Decision I Reversed

I initially designed the audit engine to use AI (the Anthropic API) for generating
recommendations — not just the summary paragraph, but the actual per-tool advice.
My reasoning was that AI could reason about nuanced usage patterns better than
hardcoded rules.

I reversed this after re-reading the assignment brief, which explicitly said:
"For the audit math itself, hardcoded rules are correct — knowing when not to use
AI is part of the test."

But more importantly, I reversed it because of what Akshat said in his user interview:
"I don't think any such tool is needed — one subscription can do it all." That quote
made me realize that if the recommendations felt vague or AI-generated, users like him
would dismiss the tool entirely. A finance person needs to read the reasoning and agree
with it — that requires explicit, traceable math, not probabilistic AI output.

The hardcoded rules approach also made testing dramatically easier. I could write
deterministic unit tests with known inputs and expected outputs. An AI-powered
recommendation engine would have been nearly impossible to test reliably.

## 3. What I'd Build in Week 2

In week 2 I would build three things in priority order.

First, a benchmark mode: "Your AI spend per developer is $X — companies your size
average $Y." Right now the audit only compares a user against official pricing. It
doesn't tell them how they compare to peers. This is the insight that would make
the results page genuinely shareable — nobody tweets "I'm overpaying for ChatGPT"
but they might tweet "My team's AI spend per dev is 40% below average."

Second, a PDF export of the full report. Several users in my interviews mentioned
they'd want to share the audit with a manager or co-founder. A shareable URL works
for peers, but a PDF works for a board meeting or budget review — a different and
higher-value context.

Third, a follow-up email sequence. Right now we send one confirmation email and
stop. Week 2 would add a 3-email sequence: day 1 confirmation, day 7 "did you act
on any of these?", day 30 "prices may have changed — re-run your audit." This turns
a one-time tool into a recurring touchpoint and dramatically increases the chances
of a Credex consultation booking.

## 4. How I Used AI Tools

I used Claude (claude.ai) as my primary AI tool throughout the week.

For scaffolding: I used Claude to generate the initial Next.js component structure,
the shadcn/ui form layout, and the Supabase schema. This saved roughly 2–3 hours of
boilerplate work.

For TypeScript debugging: When the build failed with a TypeScript error on Vercel,
I pasted the error into Claude and got the correct diagnosis immediately — the
`app/api/audit/route.ts` file was empty and needed content.

For the entrepreneurial files: I used Claude to draft GTM.md and ECONOMICS.md based
on my user interview notes and product context. I reviewed and edited both — the
economics math I verified manually, and the GTM channels I cross-checked against
what I actually know about where founders hang out online.

What I didn't trust AI with: the audit engine logic. I wrote `auditEngine.ts` myself
because the reasoning needed to be defensible and traceable. AI-generated rule logic
tends to be plausible-sounding but hard to verify. I also wrote all DEVLOG entries
manually — they needed to reflect what actually happened each day.

One specific time AI was wrong: when I asked Claude to suggest GTM channels early
in the week, it suggested "SEO and content marketing" as primary channels. That's
correct in a 12-month horizon but useless for getting the first 100 users in 30 days.
I pushed back, asked specifically for channels that work without domain authority or
existing audience, and got much more useful answers — specific subreddits, Slack
communities, and direct founder outreach tactics.

## 5. Self-Rating

**Discipline: 7/10**
I committed on 5 distinct calendar days and wrote DEVLOG entries consistently, but
took one full day off mid-week which compressed the schedule unnecessarily.

**Code Quality: 7/10**
The TypeScript types are clean, the audit engine is well-structured and fully tested,
and the component separation is reasonable. I'd improve by adding more error boundary
handling on the frontend and better loading states.

**Design Sense: 6/10**
The dark slate aesthetic is clean and consistent, and the results page hierarchy
(hero savings → per-tool breakdown → email capture) is logical. The form UX could
be improved — tool cards with logos and better visual hierarchy would make it feel
more like a product and less like a form.

**Problem Solving: 8/10**
The audit engine flag bug was caught and fixed quickly through systematic debugging.
The decision to use hardcoded rules over AI for recommendations was the right call
and I made it early enough that it didn't cost time.

**Entrepreneurial Thinking: 7/10**
The user interviews genuinely changed the product design — I didn't just talk to
people for the checkbox, I changed the audit engine based on what Akshat said about
token optimization. The GTM and economics thinking is grounded in real numbers.
I'd rate myself lower on the business model understanding — I understand the
lead-gen mechanic but have limited intuition for Credex's actual sales cycle.