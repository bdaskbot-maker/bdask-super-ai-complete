export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
  error?: string;
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
  conversation_id: string;
  meta: {
    duration_ms: number;
    iterations: number;
    tool_calls_count: number;
    model: string;
  };
  tool_calls?: {
    tool: string;
    args: string[];
    status: string;
    summary: string;
  }[];
  error?: string;
}

export interface AgentConfig {
  enableTools: boolean;
  workspaceRoot?: string;
  maxIterations?: number;
}
