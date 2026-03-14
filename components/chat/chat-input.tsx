"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, Square, Sparkles, Mic } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onCancel,
  isLoading = false,
  disabled = false,
  placeholder = "Message BDAsk Super AI...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleSubmit = useCallback(() => {
    if (!value.trim() || isLoading || disabled) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isLoading, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-card p-2 transition-colors",
          "focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20"
        )}
      >
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent px-3 py-2 text-sm outline-none",
              "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            )}
            style={{ minHeight: "40px", maxHeight: "200px" }}
          />
        </div>

        <div className="flex items-center gap-1 pb-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <Mic className="h-4 w-4" />
            <span className="sr-only">Voice input</span>
          </Button>

          {isLoading ? (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onCancel}
            >
              <Square className="h-4 w-4" />
              <span className="sr-only">Stop generation</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleSubmit}
              disabled={!value.trim() || disabled}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          <span>Powered by Gemini</span>
        </div>
        <div>
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Shift + Enter
          </kbd>
          <span className="ml-1">for new line</span>
        </div>
      </div>
    </div>
  );
}
