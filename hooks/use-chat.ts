"use client";

import { useState, useCallback, useRef } from "react";
import type { Message, ChatResponse, ToolCall, ModelKey } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface UseChatOptions {
  enableTools?: boolean;
  model?: ModelKey;
  enableThinking?: boolean;
  onError?: (error: Error) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const { enableTools = true, model = "gpt-4o", enableThinking = false, onError } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Add user message
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setActiveToolCalls([]);

      // Add placeholder assistant message
      const assistantMessageId = generateId();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/agent/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content.trim(),
            conversation_id: conversationId,
            enable_tools: enableTools,
            model,
            enable_thinking: enableThinking,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data: ChatResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Unknown error occurred");
        }

        // Update conversation ID
        if (data.conversation_id) {
          setConversationId(data.conversation_id);
        }

        // Parse tool calls
        const toolCalls: ToolCall[] =
          data.tool_calls?.map((tc) => ({
            tool: tc.tool,
            args: tc.args as unknown as Record<string, unknown>,
            summary: tc.summary,
            status: tc.status === "success" ? "success" : "error",
          })) || [];

        // Update assistant message with response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: data.response,
                  isStreaming: false,
                  toolCalls,
                  reasoning: data.reasoning,
                }
              : msg
          )
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was cancelled
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: "Request cancelled.",
                    isStreaming: false,
                  }
                : msg
            )
          );
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "An error occurred";

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content:
                      "Sorry, I encountered an error. Please try again.",
                    isStreaming: false,
                    error: errorMessage,
                  }
                : msg
            )
          );

          onError?.(error instanceof Error ? error : new Error(errorMessage));
        }
      } finally {
        setIsLoading(false);
        setActiveToolCalls([]);
        abortControllerRef.current = null;
      }
    },
    [conversationId, enableTools, model, enableThinking, isLoading, onError]
  );

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  const regenerateLastMessage = useCallback(async () => {
    if (messages.length < 2) return;

    // Find the last user message
    const lastUserMessageIndex = messages.findLastIndex(
      (m) => m.role === "user"
    );
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];

    // Remove messages after the last user message
    setMessages((prev) => prev.slice(0, lastUserMessageIndex));

    // Resend the message
    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    conversationId,
    activeToolCalls,
    sendMessage,
    cancelRequest,
    clearMessages,
    regenerateLastMessage,
    setMessages,
  };
}
