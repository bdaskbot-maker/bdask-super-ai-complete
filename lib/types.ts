export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date | string;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
  error?: string;
  reasoning?: string;
}

export interface ToolCall {
  tool: string;
  args: Record<string, unknown>;
  summary: string;
  status: "pending" | "running" | "success" | "error";
  result?: unknown;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  reasoning?: string;
  conversation_id: string;
  meta: {
    duration_ms: number;
    iterations: number;
    tool_calls_count: number;
    model: string;
    model_id?: string;
    provider?: string;
  };
  tool_calls?: {
    tool: string;
    args: Record<string, unknown>;
    status: string;
    summary: string;
  }[];
  error?: string;
}

export interface AgentConfig {
  enableTools: boolean;
  workspaceRoot?: string;
  maxIterations?: number;
  model?: ModelKey;
  enableThinking?: boolean;
}

// Available OpenAI Models
export const OPENAI_MODELS = {
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4 Omni",
    provider: "OpenAI",
    maxTokens: 4096,
    description: "Most capable, best for complex tasks",
    tier: "ai-agent" as const,
  },
  "gpt-4-turbo": {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    maxTokens: 4096,
    description: "Fast and powerful",
    tier: "ai-agent" as const,
  },
  "gpt-3.5-turbo": {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    maxTokens: 4096,
    description: "Budget-friendly option",
    tier: "ai-agent" as const,
  },
} as const;

export type ModelKey = keyof typeof OPENAI_MODELS;
export type ModelConfig = typeof OPENAI_MODELS[ModelKey];

// For backward compatibility
export const NVIDIA_MODELS = OPENAI_MODELS as any;
