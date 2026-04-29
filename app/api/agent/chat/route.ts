import { NextRequest, NextResponse } from "next/server";

// Default system prompt
const DEFAULT_SYSTEM_PROMPT = `You are BDAsk Super AI, Bangladesh's most advanced AI assistant with coding capabilities.
You can help with:
- Code writing, editing, and file operations
- Web search and research
- Task automation and project management
- Support for Bengali (বাংলা) and English languages

Be helpful, accurate, and concise. Use tools when needed to complete tasks.`;

// Available NVIDIA Models
export const NVIDIA_MODELS = {
  "kimi-k2.5": {
    id: "moonshotai/kimi-k2.5",
    name: "Kimi K2.5",
    provider: "Moonshot AI",
    hasThinking: true,
    maxTokens: 16384,
  },
  "nemotron-super": {
    id: "nvidia/nemotron-3-super-120b-a12b",
    name: "Nemotron Super 120B",
    provider: "NVIDIA",
    hasThinking: true,
    maxTokens: 16384,
  },
  "gemma-4": {
    id: "google/gemma-4-31b-it",
    name: "Gemma 4 31B",
    provider: "Google",
    hasThinking: true,
    maxTokens: 16384,
  },
  "glm-5": {
    id: "z-ai/glm-5.1",
    name: "GLM 5.1",
    provider: "Z-AI",
    hasThinking: true,
    maxTokens: 16384,
  },
} as const;

export type ModelKey = keyof typeof NVIDIA_MODELS;

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      conversation_id, 
      enable_tools = true,
      model: modelKey = "kimi-k2.5",
      enable_thinking = true,
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (message.length > 10000) {
      return NextResponse.json(
        {
          success: false,
          error: "Message too long (max 10000 characters)",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "NVIDIA_API_KEY is not configured. Please add it to your environment variables.",
        },
        { status: 500 }
      );
    }

    // Get model config
    const modelConfig = NVIDIA_MODELS[modelKey as ModelKey] || NVIDIA_MODELS["kimi-k2.5"];
    const convId = conversation_id || `conv_${Date.now()}`;
    const startTime = Date.now();

    // Build chat template kwargs based on model
    const chatTemplateKwargs: Record<string, boolean | number> = {};
    
    if (modelConfig.hasThinking && enable_thinking) {
      if (modelKey === "kimi-k2.5") {
        chatTemplateKwargs.thinking = true;
      } else if (modelKey === "glm-5") {
        chatTemplateKwargs.enable_thinking = true;
        chatTemplateKwargs.clear_thinking = false;
      } else {
        chatTemplateKwargs.enable_thinking = true;
      }
    }

    // Build request payload
    const payload: Record<string, unknown> = {
      model: modelConfig.id,
      messages: [
        { role: "system", content: DEFAULT_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      max_tokens: modelConfig.maxTokens,
      temperature: 0.7,
      top_p: 0.95,
      stream: false,
    };

    // Add chat template kwargs if not empty
    if (Object.keys(chatTemplateKwargs).length > 0) {
      payload.chat_template_kwargs = chatTemplateKwargs;
    }

    // Add reasoning budget for nemotron
    if (modelKey === "nemotron-super" && enable_thinking) {
      payload.reasoning_budget = 16384;
    }

    // Call NVIDIA API
    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("NVIDIA API Error:", response.status, errorData);
      return NextResponse.json(
        {
          success: false,
          error: `AI model error: ${errorData?.error?.message || response.statusText || "Unknown error"}`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const duration = Date.now() - startTime;

    // Extract text from response
    const responseText =
      data.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response. Please try again.";

    // Extract reasoning content if available
    const reasoningContent = data.choices?.[0]?.message?.reasoning_content || null;

    return NextResponse.json({
      success: true,
      response: responseText,
      reasoning: reasoningContent,
      conversation_id: convId,
      meta: {
        duration_ms: duration,
        iterations: 1,
        tool_calls_count: 0,
        model: modelConfig.name,
        model_id: modelConfig.id,
        provider: modelConfig.provider,
      },
      tool_calls: [],
    });
  } catch (error) {
    console.error("[Agent API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "bdask-super-agent",
    version: "2.0.0",
    nvidia_configured: !!process.env.NVIDIA_API_KEY,
    available_models: Object.entries(NVIDIA_MODELS).map(([key, config]) => ({
      key,
      ...config,
    })),
  });
}
