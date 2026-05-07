## Interview 1

**Name:** Nikunj (name used with permission)
**Role:** Student
**Company stage:** Personal projects / academic work
**Date:** 2026-05-07

**What they use:** Claude Pro, Gemini Pro, Perplexity Pro

**Key points from the conversation:**

* Uses Claude Pro heavily for large projects because of higher token limits and workflow reliability.
* Uses Perplexity mainly for academic papers and research-oriented tasks.
* Stopped using ChatGPT because they felt Gemini Pro and Perplexity Pro performed better for their use cases, especially manuscript-related work.
* Only directly pays for Claude Pro — Gemini Pro and Perplexity Pro were obtained through student offers/referral programs.
* Makes subscription decisions cautiously by testing free versions first and relying on peer/community reviews before upgrading.
* Values integrations and ecosystem accessibility in addition to raw model intelligence.

**Direct quotes:**

* "Claude pro offers more tokens and that's actually helpful in large projects."
* "I think ChatGPT is not good with manuscripts, it hallucinates frequently."
* "I only spend 20 USD on Claude monthly."
* "I also need that AI to be accessible/integrate everywhere like Claude can be integrated in many services."
* "First I use free version for a long time. then from peer reviews and community reviews, I decide whether to subscribe or not."

**Most surprising thing they said:**
The user was actively optimizing token usage using external resources like knowledge graphs and Andrej Karpathy’s LLM Wiki, which showed that advanced users think about AI costs and efficiency much more strategically than expected.

**What it changed about my design:**
This conversation made me realize the audit tool should not only detect overspending, but also surface free student plans, referral-based discounts, and integration/workflow advantages. I also added the idea of including “trust signals” beside recommendations — such as community adoption, workflow compatibility, and integration support — instead of showing only pricing comparisons.



## Interview 2

**Name:** Akshat (name shortened for privacy)
**Role:** SDE 2 / Frontend Developer
**Company stage:** Engineering team / enterprise workflow
**Date:** 2026-05-07

**What they use:** Claude Code Enterprise, Opus 4.x, Codex

**Key points from the conversation:**

* Previously used GitHub Copilot but completely stopped using it after switching workflows.
* Chose Claude Code primarily because it is terminal-friendly and supports useful plugins/workflow integrations.
* Strongly preferred Claude Code + Opus over Copilot due to better code quality, context handling, workflow integration, and developer experience.
* Uses multiple coding-focused AI tools selectively but sees Claude Code as the primary workflow tool.
* Believes AI coding tools significantly improve engineering productivity and are worth the subscription cost in professional development workflows.
* Did not think subscription-overlap auditing was a major problem for advanced engineering teams.
* Identified token optimization as a much larger pain point than subscription management itself.
* Suggested benchmarking models through LLM Arena/community evaluation rather than relying purely on marketing claims.

**Direct quotes:**

* "Copilot is shit. Was using it earlier."
* "Claude code is terminal friendly and with lots of useful plugins."
* "Claude coder and Codex performs way better than co-pilot."
* "All of the above."
* "I don't think any such tool is needed. As one subscription can do it all."
* "The main pain point is how can you optimize token usage."

**Most surprising thing they said:**
The user did not consider subscription overlap or redundant AI tooling to be a major issue at all. Instead, they viewed token optimization and workflow efficiency as the real engineering pain point, which was very different from my original assumption while designing the product.

**What it changed about my design:**
Initially, I was focused mainly on detecting redundant subscriptions and cost overlap between AI tools. This interview made me realize that advanced engineering teams care more about token efficiency, workflow integration, and context handling than simply reducing the number of subscriptions. Because of this, I added the idea of including token-usage optimization insights and workflow-based recommendations instead of focusing only on subscription savings.

## Interview 3 
## Interview 3

**Name:** Assistant Professor, K.J. Somaiya (anonymized)
**Role:** Assistant Professor
**Company stage:** Academic / Higher Education Institution
**Date:** 2026-05-07

**What they use:** Gemini, Claude, Perplexity

**Key points from the conversation:**

* Uses different AI tools for specialized academic workflows rather than relying on a single platform.
* Prefers Gemini for Google Workspace integrations such as drafting emails, summarizing Sheets data, and preparing lecture slides.
* Uses Claude for academic writing, coding explanations, and research simulations because of stronger reasoning and reliability.
* Uses Perplexity heavily for literature reviews because citation-backed responses are critical in academia.
* Believes AI tools significantly improve productivity for content preparation and coding workflows, but not necessarily for research thinking itself due to fact-checking overhead.
* Introduced the concept of the “Jagged Frontier,” where AI can solve highly advanced tasks while simultaneously failing at simpler contextual ones.
* Does not believe academia will standardize around a single AI platform because different tools specialize in different domains.
* Emphasized “AI Literacy over Tool Literacy” as the institutional direction at K.J. Somaiya.
* Identified evaluation fairness and assessment integrity as one of the biggest unresolved academic challenges with widespread AI adoption.
* Believes users start paying for AI tools once they evolve from “search alternatives” into “workflow partners.”

**Direct quotes:**

* "Perplexity has replaced traditional search for my literature reviews."
* "In terms of content preparation, it’s a 10x improvement."
* "We call it the 'Jagged Frontier' — the AI can solve a PhD-level math problem but might still get a simple local context wrong."
* "We encourage AI Literacy over Tool Literacy."
* "People pay when the tool moves from being a 'Search Alternative' to a 'Workflow Partner.'"
* "Accuracy/Verifiability: In academia, a 'hallucination' isn't just a mistake; it’s a liability."

**Most surprising thing they said:**
The idea of the “Jagged Frontier” was especially surprising — that AI systems can perform exceptionally well on highly advanced tasks while simultaneously failing on simpler contextual or localized tasks. This reframed how I thought about user trust and reliability in AI workflows.

**What it changed about my design:**
Initially, my product focused mainly on subscription overlap and pricing optimization. This interview made me realize that trust, verifiability, privacy, and workflow integration are often more important than raw cost savings — especially in academic and enterprise environments. Because of this, I added the idea of including “trust signals” alongside recommendations, such as citation reliability, privacy guarantees, integration quality, and workflow fit instead of only comparing pricing tiers.
