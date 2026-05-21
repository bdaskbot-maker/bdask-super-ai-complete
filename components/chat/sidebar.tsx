"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { OPENAI_MODELS, type ModelKey } from "@/lib/types";
import {
  MessageSquarePlus,
  History,
  Settings,
  Wrench,
  Github,
  ChevronLeft,
  Zap,
  Code2,
  Globe,
  FileSearch,
  Terminal,
  Cpu,
  Brain,
  Check,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  enableTools: boolean;
  onToggleTools: (enabled: boolean) => void;
  enableThinking: boolean;
  onToggleThinking: (enabled: boolean) => void;
  selectedModel: ModelKey;
  onSelectModel: (model: ModelKey) => void;
  onNewChat: () => void;
}

const capabilities = [
  { icon: Code2, label: "Code Generation", description: "Write & edit code" },
  { icon: FileSearch, label: "File Operations", description: "Read, write, search" },
  { icon: Globe, label: "Web Search", description: "Search & fetch web content" },
  { icon: Terminal, label: "Command Execution", description: "Run bash commands" },
];

export function Sidebar({
  isOpen,
  onToggle,
  enableTools,
  onToggleTools,
  enableThinking,
  onToggleThinking,
  selectedModel,
  onSelectModel,
  onNewChat,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r bg-card transition-transform duration-300",
          "md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">BDAsk Super AI</h1>
              <p className="text-xs text-muted-foreground">NVIDIA Powered</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={onToggle}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            className="w-full justify-start gap-2"
            onClick={onNewChat}
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-4">
          {/* Model Selection */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Cpu className="h-3 w-3" />
              AI Model
            </div>
            <div className="space-y-1.5">
              {(Object.entries(OPENAI_MODELS) as [ModelKey, typeof OPENAI_MODELS[ModelKey]][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    onClick={() => onSelectModel(key)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors",
                      selectedModel === key
                        ? "bg-primary/10 ring-1 ring-primary/30"
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded",
                        selectedModel === key
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {selectedModel === key ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Brain className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">
                          {config.name}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {config.provider}
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* History Section */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <History className="h-3 w-3" />
              Recent Chats
            </div>
            <div className="space-y-1">
              <div className="rounded-lg bg-muted/50 p-3 text-center text-sm text-muted-foreground">
                No recent chats
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Wrench className="h-3 w-3" />
              Capabilities
            </div>
            <div className="space-y-2">
              {capabilities.map((cap) => (
                <div
                  key={cap.label}
                  className="flex items-start gap-3 rounded-lg bg-muted/30 p-2.5"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                    <cap.icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{cap.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {cap.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Settings className="h-3 w-3" />
              Settings
            </div>
            <div className="space-y-3 rounded-lg bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Enable Tools</div>
                  <div className="text-xs text-muted-foreground">
                    Allow AI to use coding tools
                  </div>
                </div>
                <Switch
                  checked={enableTools}
                  onCheckedChange={onToggleTools}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Deep Thinking</div>
                  <div className="text-xs text-muted-foreground">
                    Enable reasoning mode
                  </div>
                </div>
                <Switch
                  checked={enableThinking}
                  onCheckedChange={onToggleThinking}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <a
            href="https://github.com/bdaskbot-maker/bdask-super-ai-complete"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </aside>
    </>
  );
}
