import { FormState, ToolName } from "./types";
import { OFFICIAL_PRICING } from "./pricingData";

export interface ToolAuditResult {
  tool: ToolName;
  toolLabel: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedPlan?: string;
  estimatedSavings: number;
  reason: string;
  flag: "overpaying" | "optimal" | "redundant" | "credits";
}

export interface AuditResult {
  results: ToolAuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  showCredex: boolean;
  summary: string;
}

const TOOL_LABELS: Record<ToolName, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API Direct",
  openai_api: "OpenAI API Direct",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

export function runAudit(form: FormState): AuditResult {
  const results: ToolAuditResult[] = [];
  const enabledTools = (Object.keys(form.tools) as ToolName[]).filter(
    (t) => form.tools[t].enabled
  );

  // Check for redundant coding tools
  const codingTools = enabledTools.filter((t) =>
    ["cursor", "github_copilot", "windsurf"].includes(t)
  );
  const hasRedundantCodingTools = codingTools.length > 1;

  // Check for redundant chat tools
  const chatTools = enabledTools.filter((t) =>
    ["claude", "chatgpt", "gemini"].includes(t)
  );
  const hasRedundantChatTools = chatTools.length > 1;

  // Check for both API + subscription of same vendor
  const hasClaudeAndAnthropicApi =
    enabledTools.includes("claude") && enabledTools.includes("anthropic_api");
  const hasChatGPTAndOpenAIApi =
    enabledTools.includes("chatgpt") && enabledTools.includes("openai_api");

  for (const tool of enabledTools) {
    const entry = form.tools[tool];
    const officialPrice =
      OFFICIAL_PRICING[tool]?.[entry.plan] ?? 0;
    const expectedSpend = officialPrice * entry.seats;
    const currentSpend = entry.monthlySpend;
    let result: ToolAuditResult = {
      tool,
      toolLabel: TOOL_LABELS[tool],
      currentSpend,
      recommendedAction: "No changes needed.",
      estimatedSavings: 0,
      reason: "Your plan and spend align with official pricing.",
      flag: "optimal",
    };

    // 1. Overpaying vs official price
    if (officialPrice > 0 && currentSpend > expectedSpend * 1.05) {
      const savings = currentSpend - expectedSpend;
      result = {
        ...result,
        recommendedAction: `Verify your billing — you're paying $${currentSpend}/mo but official price is $${expectedSpend}/mo for ${entry.seats} seat(s).`,
        estimatedSavings: savings,
        reason: `Official ${entry.plan} plan is $${officialPrice}/seat/mo × ${entry.seats} seats = $${expectedSpend}/mo. You're paying $${savings.toFixed(2)}/mo more than expected.`,
        flag: "overpaying",
      };
    }

    // 2. Plan fit — Team plan for small teams
    if (tool === "chatgpt" && entry.plan === "Team" && entry.seats <= 2) {
      const plusCost = 20 * entry.seats;
      const teamCost = 30 * entry.seats;
      const savings = teamCost - plusCost;
      result = {
        ...result,
        recommendedAction: `Downgrade to ChatGPT Plus ($20/seat)`,
        recommendedPlan: "Plus",
        estimatedSavings: savings,
        reason: `ChatGPT Team ($30/seat) is designed for collaboration features across larger teams. With ${entry.seats} user(s), Plus ($20/seat) gives the same core model access and saves $${savings}/mo.`,
        flag: "overpaying",
      };
    }

    if (tool === "claude" && entry.plan === "Team" && entry.seats <= 2) {
      const proSavings = (30 - 20) * entry.seats;
      result = {
        ...result,
        recommendedAction: `Downgrade to Claude Pro ($20/seat)`,
        recommendedPlan: "Pro",
        estimatedSavings: proSavings,
        reason: `Claude Team ($30/seat) adds admin controls and centralized billing — unnecessary for ${entry.seats} user(s). Pro ($20/seat) provides the same model access and saves $${proSavings}/mo.`,
        flag: "overpaying",
      };
    }

    if (
      tool === "github_copilot" &&
      entry.plan === "Business" &&
      entry.seats === 1
    ) {
      const savings = (19 - 10) * 1;
      result = {
        ...result,
        recommendedAction: `Downgrade to GitHub Copilot Individual ($10/mo)`,
        recommendedPlan: "Individual",
        estimatedSavings: savings,
        reason: `Copilot Business ($19/seat) adds policy management and org-wide controls — features only useful for teams. Individual ($10/mo) covers all core coding assistance for a solo developer and saves $${savings}/mo.`,
        flag: "overpaying",
      };
    }

    // 3. Redundant coding tools
    if (
      hasRedundantCodingTools &&
      codingTools.includes(tool) &&
      tool !== codingTools[0]
    ) {
      result = {
        ...result,
        recommendedAction: `Consider dropping — you already pay for ${TOOL_LABELS[codingTools[0]]}`,
        estimatedSavings: currentSpend,
        reason: `You're paying for ${codingTools.length} AI coding assistants (${codingTools.map((t) => TOOL_LABELS[t]).join(", ")}). These tools have significant feature overlap for ${form.useCase} workflows. Consolidating to one saves $${currentSpend}/mo with minimal productivity loss.`,
        flag: "redundant",
      };
    }

    // 4. Redundant chat tools
    if (
      hasRedundantChatTools &&
      chatTools.includes(tool) &&
      tool !== chatTools[0]
    ) {
      result = {
        ...result,
        recommendedAction: `Consider consolidating — overlaps with ${TOOL_LABELS[chatTools[0]]}`,
        estimatedSavings: Math.round(currentSpend * 0.5),
        reason: `You're subscribed to ${chatTools.length} general AI assistants. For ${form.useCase} use cases, one well-chosen tool typically covers 90%+ of needs. Dropping the lower-priority subscription saves approximately $${Math.round(currentSpend * 0.5)}/mo.`,
        flag: "redundant",
      };
    }

    // 5. API + subscription overlap
    if (
      (tool === "anthropic_api" && hasClaudeAndAnthropicApi) ||
      (tool === "openai_api" && hasChatGPTAndOpenAIApi)
    ) {
      result = {
        ...result,
        recommendedAction: `Consolidate — API access overlaps with your subscription`,
        estimatedSavings: Math.round(currentSpend * 0.4),
        reason: `You're paying for both a subscription and direct API access to the same vendor. Unless you have distinct use cases requiring both, consolidating to one access method typically saves 30–50% on that vendor's spend.`,
        flag: "redundant",
      };
    }

    // 6. Credits opportunity for high spend
    if (currentSpend >= 50 && result.flag === "optimal") {
  result = {
    ...result,
    flag: "credits",
  };
}

    results.push(result);
  }

  const totalMonthlySavings = results.reduce(
    (sum, r) => sum + r.estimatedSavings,
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;
  const showCredex = totalMonthlySavings >= 500;

  const summary =
    totalMonthlySavings > 0
      ? `Based on your ${form.useCase} workflow with a team of ${form.teamSize}, we identified $${totalMonthlySavings.toFixed(0)}/mo in potential savings across ${results.filter((r) => r.estimatedSavings > 0).length} tool(s). The biggest opportunity is ${results.sort((a, b) => b.estimatedSavings - a.estimatedSavings)[0]?.toolLabel}.`
      : `Your AI tool spend looks well-optimized for a ${form.teamSize}-person team doing ${form.useCase} work. No major savings opportunities found right now.`;

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings,
    showCredex,
    summary,
  };
}