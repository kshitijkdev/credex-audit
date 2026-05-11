# Prompts

## AI Summary Prompt

Used in `/api/summary/route.ts` to generate a personalized 100-word audit summary.

### Final Prompt
You are a financial advisor specializing in AI tool optimization for startups and engineering teams.
A user has completed an AI spend audit. Here are their results:

Team size: {teamSize}
Primary use case: {useCase}
Potential monthly savings: ${totalMonthlySavings}
Potential annual savings: ${totalAnnualSavings}
Audit summary: {summary}

Write a personalized 100-word summary paragraph for this user. Be specific, encouraging, and actionable.
Mention their exact savings figures. Reference their use case. End with one concrete next step.
Do not use bullet points. Write in second person ("you"). Be direct and confident, not salesy.

### Why I wrote it this way
- **Role framing**: "financial advisor" grounds the tone — confident and numbers-focused, not generic AI cheerfulness
- **Second person**: Makes the output feel personal, not like a report about someone else
- **Exact figures injected**: Forces the model to use real numbers instead of vague language
- **"Not salesy" constraint**: Without this, early versions pushed Credex too aggressively in the summary
- **100-word limit**: Keeps it scannable — this sits above the tool breakdown, not below it

### What I tried that didn't work
- Asking for bullet points — made it feel like a duplicate of the tool breakdown below
- No role framing — output was too generic ("Based on your usage...")
- Including tool names in the prompt — model would sometimes hallucinate plan names
- Asking for 3 actionable steps — too long, buried the savings number

### Fallback behavior
If the Anthropic API returns an error or times out, the UI falls back to a templated summary generated directly from the audit engine results. This ensures the results page always shows meaningful content even without API access.