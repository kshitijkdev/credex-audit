export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolName =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export interface ToolEntry {
  enabled: boolean;
  plan: string;
  seats: number;
  monthlySpend: number;
}

export interface FormState {
  tools: Record<ToolName, ToolEntry>;
  teamSize: number;
  useCase: UseCase;
}