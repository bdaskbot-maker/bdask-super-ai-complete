import { NextRequest, NextResponse } from "next/server";

// ==========================================
// AGENT TIER DEFINITIONS
// ==========================================

// TIER 1: AI AGENT - Foundation Agent
const AI_AGENT_SYSTEM_PROMPT = `You are AI Agent, BDAsk's foundational AI assistant.
Core capabilities:
- Natural language understanding in Bengali and English
- File operations (read, write, search)
- Web search and information retrieval
- Code execution and debugging
- Real-time conversation management

You are helpful, accurate, and concise. Use tools when needed.`;

// TIER 2: SUPER AGENT - Enterprise Agent
const SUPER_AGENT_SYSTEM_PROMPT = `You are Super Agent, an advanced autonomous AI system.
Advanced capabilities:
- Task planning and breakdown
- Multi-tier memory management (short/long term)
- Knowledge base building and learning
- Complex problem solving
- Event-driven task execution
- Real-time progress streaming

You operate with planning, memory, and knowledge acquisition.`;

// TIER 3: DEV AGENT - Development Agent
const DEV_AGENT_SYSTEM_PROMPT = `You are Dev Agent (E1), a full-stack development specialist.
Development expertise:
- React frontend development with mock data
- Backend API design (Express/FastAPI)
- Database schema design
- Testing framework setup
- Deployment automation
- Full-stack integration

You deliver production-ready applications with complete documentation.`;

// Import models from shared types
import { OPENAI_MODELS, type ModelKey } from "@/lib/types";

export type AgentTier = "ai-agent" | "super-agent" | "dev-agent";

// ==========================================
// API ENDPOINT: AI AGENT (Tier 1)
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      conversation_id,
      model: modelKey = "gpt-4o",
      tier = "ai-agent",
    } = body;

    // Validation
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length > 10000) {
      return NextResponse.json(
        { success: false, error: "Message too long (max 10000)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Get model config
    const modelConfig = OPENAI_MODELS[modelKey as ModelKey] || OPENAI_MODELS["gpt-4o"];
    const convId = conversation_id || `conv_${Date.now()}`;
    const startTime = Date.now();

    // Select system prompt based on tier
    let systemPrompt = AI_AGENT_SYSTEM_PROMPT;
    if (tier === "super-agent") {
      systemPrompt = SUPER_AGENT_SYSTEM_PROMPT;
    } else if (tier === "dev-agent") {
      systemPrompt = DEV_AGENT_SYSTEM_PROMPT;
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelConfig.id,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: modelConfig.maxTokens,
        temperature: 0.7,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData?.error?.message || "API error" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const duration = Date.now() - startTime;
    const responseText = data.choices?.[0]?.message?.content || "No response";

    return NextResponse.json({
      success: true,
      response: responseText,
      conversation_id: convId,
      agent_tier: tier,
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// GET ENDPOINT: Agent Information
// ==========================================
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "bdask-super-agent",
    version: "3.0.0-openai",
    openai_configured: !!process.env.OPENAI_API_KEY,
    agents: {
      "ai-agent": {
        name: "AI Agent",
        tier: 1,
        capabilities: ["chat", "file-ops", "web-search", "code-exec"],
        description: "Foundational conversational AI assistant",
        default_model: "gpt-4o",
      },
      "super-agent": {
        name: "Super Agent",
        tier: 2,
        capabilities: ["chat", "planning", "memory", "knowledge", "reasoning"],
        description: "Enterprise-grade autonomous agent with advanced features",
        default_model: "gpt-4o",
      },
      "dev-agent": {
        name: "Dev Agent (E1)",
        tier: 3,
        capabilities: ["frontend-dev", "backend-dev", "testing", "deployment"],
        description: "Full-stack development automation specialist",
        default_model: "gpt-4o",
      },
    },
    available_models: Object.entries(OPENAI_MODELS).map(([key, config]) => ({
      key,
      ...config,
    })),
  });
}
