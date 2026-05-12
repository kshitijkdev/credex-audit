# Unit Economics

## What's a Converted Lead Worth to Credex?

Credex sells discounted AI infrastructure credits. Assumptions based on publicly
available pricing and reasonable estimates:

- Average AI tool spend for a 5–20 person startup: $500–$2,000/month
- Credex discount vs retail: ~20–30%
- If a customer buys $1,000/month in credits through Credex:
  - Credex margin estimate: 15–20% = $150–$200/month gross profit
  - Annual value per customer: $1,800–$2,400
- Conservative LTV estimate (12-month retention): **$1,800 per converted customer**
- Optimistic LTV estimate (24-month retention): **$4,800 per converted customer**

## Customer Acquisition Cost (CAC) by Channel

| Channel | Effort | Est. Visitors/mo | Audit Completion (20%) | Email Capture (25%) | Consult Booking (10%) | CAC |
|---------|--------|-------------------|------------------------|----------------------|-----------------------|-----|
| HN Show HN | 1 post | 500 | 100 | 25 | 2–3 | ~$0 |
| Reddit (r/SaaS) | 2 posts/week | 300 | 60 | 15 | 1–2 | ~$0 |
| Twitter/X organic | 30 min/day | 200 | 40 | 10 | 1 | ~$0 |
| Direct vendor outreach | Credex relationship | 100 | 30 | 10 | 2–3 | ~$0 |

All channels are $0 paid budget. CAC is purely time cost.
At 10 hrs/week of distribution effort: **effective CAC ≈ $50–$150** (time-valued).

## Conversion Funnel
Landing page visit
↓ 20% complete audit
Audit completed
↓ 25% submit email
Lead captured
↓ 10% book consultation
Consultation booked
↓ 40% convert to credit purchase
Credit purchase

**Overall funnel: 1,000 visitors → 200 audits → 50 leads → 5 consultations → 2 customers**

At $1,800 LTV per customer: **$3,600 revenue per 1,000 visitors**

## Break-Even Analysis

Monthly operating costs (tool + hosting):
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Resend: $0 (free tier covers ~3,000 emails/month)
- Anthropic API: ~$10/month at current volume
- **Total: ~$55/month**

Break-even: **1 converted customer every 3 months** covers all tool costs.
First customer covers 32 months of infrastructure costs.

## What Would Have to Be True for $1M ARR in 18 Months

$1M ARR = ~$83,000/month gross profit to Credex

At $150/month gross profit per customer:
- Need **~555 active paying customers** at month 18

Working backwards from the funnel:
- 555 customers ÷ 2% overall conversion = **27,750 audit completions**
- At 200 audits/month in month 1, growing 15% month-over-month:
  - Month 1: 200 audits
  - Month 6: ~400 audits
  - Month 12: ~800 audits
  - Month 18: ~1,600 audits
  - **Cumulative: ~14,000 audits** — falls short of 27,750

To hit $1M ARR in 18 months requires either:
1. **Higher conversion rate** — improving consult → purchase from 40% to 60%, OR
2. **Paid distribution** — $5,000/month in targeted LinkedIn/Twitter ads to engineering managers, OR
3. **Higher ACV** — enterprise customers spending $5,000+/month in credits (fewer customers needed), OR
4. **Vendor partnerships** — Credex's existing vendor relationships funneling warm leads directly

**Most realistic path:** Organic + vendor partnerships for first 6 months, then selective paid
distribution once conversion rates are proven. $1M ARR is achievable in 24 months organically,
or 18 months with $3,000–$5,000/month in paid spend starting month 6.

## Key Assumptions to Validate First

- Audit completion rate (assumed 20%) — instrument immediately
- Email capture rate (assumed 25%) — A/B test CTA copy
- Consult booking rate (assumed 10%) — may be lower without follow-up sequence
- LTV (assumed $1,800) — depends heavily on Credex retention data