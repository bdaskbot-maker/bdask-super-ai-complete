"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn, formatTimestamp } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/types";
import {
  User,
  Bot,
  Copy,
  Check,
  RefreshCw,
  FileCode,
  Search,
  Terminal,
  Globe,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  isLast?: boolean;
}

const toolIcons: Record<string, React.ReactNode> = {
  Read: <FileCode className="h-3 w-3" />,
  Write: <FileCode className="h-3 w-3" />,
  Edit: <FileCode className="h-3 w-3" />,
  Glob: <Search className="h-3 w-3" />,
  Grep: <Search className="h-3 w-3" />,
  Bash: <Terminal className="h-3 w-3" />,
  WebSearch: <Globe className="h-3 w-3" />,
  WebFetch: <Globe className="h-3 w-3" />,
};

export const ChatMessage = memo(function ChatMessage({
  message,
  onRegenerate,
  isLast,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "message-animate group flex gap-3 py-4 px-4 md:px-6",
        isUser ? "bg-transparent" : "bg-card/50"
      )}
    >
      <Avatar className={cn("h-8 w-8 shrink-0", isUser ? "order-2" : "order-1")}>
        <AvatarFallback
          className={cn(
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex-1 space-y-2 overflow-hidden",
          isUser ? "order-1" : "order-2"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isUser ? "You" : "BDAsk Super AI"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        {message.isStreaming ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="typing-indicator">
              <span />
              <span />
              <span />
            </div>
            <span className="text-sm">Thinking...</span>
          </div>
        ) : (
          <>
            {message.error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{message.error}</span>
              </div>
            )}

            <div
              className={cn(
                "prose prose-sm max-w-none dark:prose-invert",
                isUser && "text-right"
              )}
            >
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match;

                    if (isInline) {
                      return (
                        <code
                          className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="relative my-4 syntax-dark">
                        <div className="absolute right-2 top-2 z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-background/50 hover:bg-background"
                            onClick={() => {
                              navigator.clipboard.writeText(String(children));
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg !bg-[hsl(222,47%,8%)] !my-0"
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="my-2 list-disc pl-4">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="my-2 list-decimal pl-4">{children}</ol>;
                  },
                  li({ children }) {
                    return <li className="my-1">{children}</li>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Tool calls */}
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground">
                  Tools Used
                </div>
                <div className="flex flex-wrap gap-2">
                  {message.toolCalls.map((tc, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs",
                        tc.status === "success"
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {toolIcons[tc.tool] || <Terminal className="h-3 w-3" />}
                      <span>{tc.summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {isAssistant && !message.isStreaming && (
              <div className="flex items-center gap-1 pt-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="mr-1 h-3 w-3" />
                  ) : (
                    <Copy className="mr-1 h-3 w-3" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
                {isLast && onRegenerate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={onRegenerate}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Regenerate
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});
