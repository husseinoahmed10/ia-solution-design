"use client";

import { Bot, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AiArchitectPanel } from "@/features/ai-workspace/ai-architect-panel";
import { AiSpecsPanel } from "@/features/ai-workspace/ai-specs-panel";
import { useAiArchitectChat } from "@/hooks/use-ai-architect-chat";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * The AI workspace: the right-hand panel holding the AI Architect conversation
 * and the project's specifications.
 *
 * This component is the **shell only** — the placement, the slide, and the
 * header — and the two tabs are `features/ai-workspace/`. Its open state is
 * still owned by `EditorShell` and still toggled from the navbar; nothing about
 * how it opens changed with the contents.
 *
 * The overlay mechanics are the project sidebar's, unchanged: a positioned
 * `<aside>` inside the canvas region on `bg-card` with a `border-l`, sliding
 * between `translate-x-full` and `translate-x-0`, and `inert` plus `aria-hidden`
 * while closed so its controls — now including a text field — stay out of the
 * tab order. Opening it therefore never reflows the canvas.
 *
 * **Nothing here calls a model or an API.** Both tabs are the workspace's
 * structure; the AI itself is a later unit, and `isThinking` in
 * `liveblocks.config.ts` is deliberately still unused.
 */
export function AiSidebar({ isOpen, onClose, className }: AiSidebarProps) {
  /*
   * The conversation is owned here, at the sidebar, rather than inside the tab
   * that shows it: Radix `Tabs` unmounts the inactive panel, so a look at
   * `Specs` would otherwise discard both the messages and a half-typed draft.
   * It is still entirely local to this panel — see the hook.
   */
  const architectChat = useAiArchitectChat();

  return (
    <aside
      aria-label="AI workspace"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "absolute inset-y-0 right-0 z-40 flex w-80 flex-col border-l border-border bg-card transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border p-3">
        <div className="flex min-w-0 items-start gap-2">
          {/*
           * The same tinted-square-and-accent-icon treatment as the auth brand
           * panel's feature rows, so the workspace is marked as an AI surface
           * with tokens the theme already has.
           */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-surface">
            <Bot className="size-4 text-primary" aria-hidden />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight">
              AI Workspace
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              Design your automation solution
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close AI workspace"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>

      {/*
       * The `Tabs` primitive as generated: its active trigger already takes the
       * accent surface and `--foreground` while the inactive one stays muted, so
       * the two tabs read exactly as the project sidebar's do.
       */}
      <Tabs defaultValue="ai-architect" className="min-h-0 flex-1 gap-3 p-3">
        <TabsList className="w-full">
          <TabsTrigger value="ai-architect">AI Architect</TabsTrigger>
          <TabsTrigger value="specs">Specs</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-architect" className="flex min-h-0 flex-col">
          <AiArchitectPanel chat={architectChat} />
        </TabsContent>

        <TabsContent value="specs" className="flex min-h-0 flex-col">
          <AiSpecsPanel />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
