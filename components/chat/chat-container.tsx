"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { WelcomeScreen } from "./welcome-screen";
import { useChat } from "@/hooks/use-chat";
import { OPENAI_MODELS, type ModelKey } from "@/lib/types";

export function ChatContainer() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [enableTools, setEnableTools] = useState(true);
  const [enableThinking, setEnableThinking] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelKey>("gpt-4o");
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
    model: selectedModel,
    enableThinking,
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

  const currentModel = OPENAI_MODELS[selectedModel];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        enableTools={enableTools}
        onToggleTools={setEnableTools}
        enableThinking={enableThinking}
        onToggleThinking={setEnableThinking}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onNewChat={handleNewChat}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onClearChat={clearMessages}
          conversationId={conversationId}
          modelName={currentModel.name}
          providerName={currentModel.provider}
        />

        <div className="flex flex-1 flex-col overflow-hidden w-full">
          {messages.length === 0 ? (
            <WelcomeScreen 
              onSuggestionClick={handleSuggestionClick}
              modelName={currentModel.name}
            />
          ) : (
            <ScrollArea className="flex-1 w-full">
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
              placeholder={`Message ${currentModel.name}... ${enableTools ? "(Tools enabled)" : ""}`}
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Powered by {currentModel.provider}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
