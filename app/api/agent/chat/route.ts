import { NextRequest, NextResponse } from "next/server";

// Default system prompt
const DEFAULT_SYSTEM_PROMPT = `You are BDAsk Super AI, Bangladesh's most advanced AI assistant with coding capabilities.
You can help with:
- Code writing, editing, and file operations
- Web search and research
- Task automation and project management
- Support for Bengali (বাংলা) and English languages

Be helpful, accurate, and concise. Use tools when needed to complete tasks.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversation_id, enable_tools = true } = body;

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

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY is not configured. Please add it to your environment variables.",
        },
        { status: 500 }
      );
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
    const convId = conversation_id || `conv_${Date.now()}`;
    const startTime = Date.now();

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: DEFAULT_SYSTEM_PROMPT }],
            },
            {
              role: "model",
              parts: [
                {
                  text: "Understood. I am BDAsk Super AI ready to assist with coding, file operations, and task execution. I support both Bengali and English.",
                },
              ],
            },
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to get response from AI model",
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const duration = Date.now() - startTime;

    // Extract text from response
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I couldn't generate a response. Please try again.";

    // Check if query was in Bengali
    const isBengaliQuery = /[\u0980-\u09FF]/.test(message);

    return NextResponse.json({
      success: true,
      response: responseText,
      conversation_id: convId,
      meta: {
        duration_ms: duration,
        iterations: 1,
        tool_calls_count: 0,
        model,
      },
      tool_calls: [],
    });
  } catch (error) {
    console.error("[Agent API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
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
    gemini_configured: !!process.env.GEMINI_API_KEY,
  });
}
