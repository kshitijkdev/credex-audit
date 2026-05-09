export const TOOL_PLANS: Record<string, string[]> = {
  cursor: ["Hobby", "Pro", "Business", "Enterprise"],
  github_copilot: ["Individual", "Business", "Enterprise"],
  claude: ["Free", "Pro", "Max", "Team", "Enterprise", "API Direct"],
  chatgpt: ["Plus", "Team", "Enterprise", "API Direct"],
  anthropic_api: ["API Direct"],
  openai_api: ["API Direct"],
  gemini: ["Free", "Pro", "Ultra", "API Direct"],
  windsurf: ["Free", "Pro", "Teams", "Enterprise"],
};

export const TOOL_LABELS: Record<string, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API Direct",
  openai_api: "OpenAI API Direct",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

// Official pricing — sources in PRICING_DATA.md
export const OFFICIAL_PRICING: Record<string, Record<string, number>> = {
  cursor: {
    Hobby: 0,
    Pro: 20,
    Business: 40,
    Enterprise: 0, // custom
  },
  github_copilot: {
    Individual: 10,
    Business: 19,
    Enterprise: 39,
  },
  claude: {
    Free: 0,
    Pro: 20,
    Max: 100,
    Team: 30,
    Enterprise: 0,
    "API Direct": 0,
  },
  chatgpt: {
    Plus: 20,
    Team: 30,
    Enterprise: 0,
    "API Direct": 0,
  },
  anthropic_api: { "API Direct": 0 },
  openai_api: { "API Direct": 0 },
  gemini: {
    Free: 0,
    Pro: 20,
    Ultra: 30,
    "API Direct": 0,
  },
  windsurf: {
    Free: 0,
    Pro: 15,
    Teams: 35,
    Enterprise: 0,
  },
};