# Tests

## Audit Engine Tests

**File:** `lib/auditEngine.test.ts`  
**Framework:** Vitest  
**How to run:** `npm test`

| # | Test Name | What it covers |
|---|-----------|----------------|
| 1 | detects overpaying when spend exceeds official price | Flags a tool as `overpaying` when user spend exceeds official price × seats by more than 5% |
| 2 | marks tool as optimal when spend matches official price | No false positives — correctly marks tools as `optimal` when spend aligns with official pricing |
| 3 | flags ChatGPT Team plan as overkill for 2 users | Plan-fit logic — Team plan for ≤2 users is more expensive than 2× Plus, should recommend downgrade |
| 4 | flags redundant coding tools when multiple are enabled | Redundancy detection — having Cursor + GitHub Copilot active simultaneously flags the secondary tool |
| 5 | calculates total monthly and annual savings correctly | Savings math — annual savings must equal exactly 12× monthly savings |
| 6 | flags Anthropic API when Claude subscription also enabled | API + subscription overlap — paying for both Claude Pro and Anthropic API Direct is redundant |

## How to run

```bash
npm test
```

All 6 tests must pass. CI also runs these on every push to main via `.github/workflows/ci.yml`.