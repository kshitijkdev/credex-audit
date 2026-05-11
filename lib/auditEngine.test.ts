import { describe, it, expect } from "vitest";
import { runAudit } from "./auditEngine";
import { FormState } from "./types";

const baseForm: FormState = {
  teamSize: 1,
  useCase: "coding",
  tools: {
    cursor: { enabled: false, plan: "Hobby", seats: 1, monthlySpend: 0 },
    github_copilot: { enabled: false, plan: "Individual", seats: 1, monthlySpend: 0 },
    claude: { enabled: false, plan: "Free", seats: 1, monthlySpend: 0 },
    chatgpt: { enabled: false, plan: "Plus", seats: 1, monthlySpend: 0 },
    anthropic_api: { enabled: false, plan: "API Direct", seats: 1, monthlySpend: 0 },
    openai_api: { enabled: false, plan: "API Direct", seats: 1, monthlySpend: 0 },
    gemini: { enabled: false, plan: "Free", seats: 1, monthlySpend: 0 },
    windsurf: { enabled: false, plan: "Free", seats: 1, monthlySpend: 0 },
  },
};

// Test 1: Overpaying detection
it("detects overpaying when spend exceeds official price", () => {
  const form: FormState = {
    ...baseForm,
    tools: {
      ...baseForm.tools,
      claude: { enabled: true, plan: "Pro", seats: 1, monthlySpend: 30 },
    },
  };
  const result = runAudit(form);
  const claudeResult = result.results.find((r) => r.tool === "claude");
  expect(claudeResult?.flag).toBe("overpaying");
  expect(claudeResult?.estimatedSavings).toBeGreaterThan(0);
});

// Test 2: Optimal spend — no false positives
it("marks tool as optimal when spend matches official price", () => {
  const form: FormState = {
    ...baseForm,
    tools: {
      ...baseForm.tools,
      cursor: { enabled: true, plan: "Pro", seats: 1, monthlySpend: 20 },
    },
  };
  const result = runAudit(form);
  const cursorResult = result.results.find((r) => r.tool === "cursor");
  expect(cursorResult?.flag).toBe("optimal");
  expect(cursorResult?.estimatedSavings).toBe(0);
});

// Test 3: Team plan overkill for small team
it("flags ChatGPT Team plan as overkill for 2 users", () => {
  const form: FormState = {
    ...baseForm,
    teamSize: 2,
    tools: {
      ...baseForm.tools,
      chatgpt: { enabled: true, plan: "Team", seats: 2, monthlySpend: 60 },
    },
  };
  const result = runAudit(form);
  const chatgptResult = result.results.find((r) => r.tool === "chatgpt");
  expect(chatgptResult?.flag).toBe("overpaying");
  expect(chatgptResult?.estimatedSavings).toBe(20);
});

// Test 4: Redundant coding tools
it("flags redundant coding tools when multiple are enabled", () => {
  const form: FormState = {
    ...baseForm,
    tools: {
      ...baseForm.tools,
      cursor: { enabled: true, plan: "Pro", seats: 1, monthlySpend: 20 },
      github_copilot: { enabled: true, plan: "Individual", seats: 1, monthlySpend: 10 },
    },
  };
  const result = runAudit(form);
  const copilotResult = result.results.find((r) => r.tool === "github_copilot");
  expect(copilotResult?.flag).toBe("redundant");
});

// Test 5: Total savings calculation
it("calculates total monthly and annual savings correctly", () => {
  const form: FormState = {
    ...baseForm,
    tools: {
      ...baseForm.tools,
      claude: { enabled: true, plan: "Pro", seats: 1, monthlySpend: 30 },
    },
  };
  const result = runAudit(form);
  expect(result.totalMonthlySavings).toBeGreaterThan(0);
  expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
});

// Test 6: API + subscription overlap
it("flags Anthropic API when Claude subscription also enabled", () => {
  const form: FormState = {
    ...baseForm,
    tools: {
      ...baseForm.tools,
      claude: { enabled: true, plan: "Pro", seats: 1, monthlySpend: 20 },
      anthropic_api: { enabled: true, plan: "API Direct", seats: 1, monthlySpend: 50 },
    },
  };
  const result = runAudit(form);
  const apiResult = result.results.find((r) => r.tool === "anthropic_api");
  expect(apiResult?.flag).toBe("redundant");
});