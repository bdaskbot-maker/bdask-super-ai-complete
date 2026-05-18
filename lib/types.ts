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

// Available NVIDIA Models
export const NVIDIA_MODELS = {
  "kimi-k2.5": {
    id: "moonshotai/kimi-k2.5",
    name: "Kimi K2.5",
    provider: "Moonshot AI",
    hasThinking: true,
    maxTokens: 16384,
    description: "Advanced reasoning model",
  },
  "nemotron-super": {
    id: "nvidia/nemotron-3-super-120b-a12b",
    name: "Nemotron Super 120B",
    provider: "NVIDIA",
    hasThinking: true,
    maxTokens: 16384,
    description: "NVIDIA's most powerful model",
  },
  "gemma-4": {
    id: "google/gemma-4-31b-it",
    name: "Gemma 4 31B",
    provider: "Google",
    hasThinking: true,
    maxTokens: 16384,
    description: "Google's efficient model",
  },
  "glm-5": {
    id: "z-ai/glm-5.1",
    name: "GLM 5.1",
    provider: "Z-AI",
    hasThinking: true,
    maxTokens: 16384,
    description: "Powerful language model",
  },
} as const;

export type ModelKey = keyof typeof NVIDIA_MODELS;
export type ModelConfig = typeof NVIDIA_MODELS[ModelKey];
