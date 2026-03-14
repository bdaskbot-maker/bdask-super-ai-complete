"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { WelcomeScreen } from "./welcome-screen";
import { useChat } from "@/hooks/use-chat";

export function ChatContainer() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [enableTools, setEnableTools] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    cancelRequest,
    clearMessages,
    regenerateLastMessage,
  } = useChat({
    enableTools,
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleNewChat = useCallback(() => {
    clearMessages();
    setSidebarOpen(false);
  }, [clearMessages]);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      sendMessage(suggestion);
    },
    [sendMessage]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        enableTools={enableTools}
        onToggleTools={setEnableTools}
        onNewChat={handleNewChat}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onClearChat={clearMessages}
          conversationId={conversationId}
        />

        <div className="relative flex-1 overflow-hidden">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
          ) : (
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="mx-auto max-w-4xl">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLast={index === messages.length - 1}
                    onRegenerate={
                      index === messages.length - 1 && message.role === "assistant"
                        ? regenerateLastMessage
                        : undefined
                    }
                  />
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="border-t bg-background p-4">
          <div className="mx-auto max-w-4xl">
            <ChatInput
              onSend={sendMessage}
              onCancel={cancelRequest}
              isLoading={isLoading}
              placeholder={
                enableTools
                  ? "Message BDAsk Super AI... (Tools enabled)"
                  : "Message BDAsk Super AI... (Tools disabled)"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
