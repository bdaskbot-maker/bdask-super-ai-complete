"use client";

import { Button } from "@/components/ui/button";
import {
  Zap,
  Code2,
  Search,
  FileEdit,
  Terminal,
  MessageSquare,
} from "lucide-react";

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
  modelName?: string;
}

const suggestions = [
  {
    icon: Code2,
    title: "Write Code",
    description: "Create a React component",
    prompt: "Create a modern React component for a user profile card with avatar, name, bio, and social links using Tailwind CSS",
  },
  {
    icon: Search,
    title: "Search Files",
    description: "Find files in project",
    prompt: "Find all TypeScript files that contain 'useState' hook in this project",
  },
  {
    icon: FileEdit,
    title: "Edit Files",
    description: "Modify existing code",
    prompt: "Read the package.json file and explain what dependencies are installed",
  },
  {
    icon: Terminal,
    title: "Run Commands",
    description: "Execute bash commands",
    prompt: "List all files in the current directory and show their sizes",
  },
];

export function WelcomeScreen({ onSuggestionClick, modelName = "BDAsk AI" }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <Zap className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">BDAsk Super AI</h1>
        <p className="max-w-md text-muted-foreground">
          Bangladesh&apos;s most advanced AI assistant powered by <span className="font-medium text-foreground">{modelName}</span>.
          I can help you write code, search files, execute commands, and more.
        </p>
        <p className="mt-2 text-sm text-primary">
          বাংলা এবং English উভয় ভাষায় সাহায্য করতে পারি
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.title}
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4 text-left hover:bg-accent/50"
            onClick={() => onSuggestionClick(suggestion.prompt)}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <suggestion.icon className="h-4 w-4" />
              </div>
              <span className="font-medium">{suggestion.title}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {suggestion.description}
            </span>
          </Button>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <MessageSquare className="h-4 w-4" />
        <span>Ask me anything or try one of the suggestions above</span>
      </div>
    </div>
  );
}
