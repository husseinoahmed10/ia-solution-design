"use client";

import { Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * Right-hand panel for the future AI design assistant.
 *
 * A placeholder in this unit: it opens and closes from the navbar toggle and
 * occupies the right-side workspace area, but there is no chat, no model call,
 * and no state beyond being open. It mirrors the project sidebar's overlay
 * mechanics — a positioned `<aside>` inside the canvas region, `inert` while
 * closed so its controls stay out of the tab order — so opening it never reflows
 * the canvas.
 */
export function AiSidebar({ isOpen, onClose, className }: AiSidebarProps) {
  return (
    <aside
      aria-label="AI design assistant"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "absolute inset-y-0 right-0 z-40 flex w-80 flex-col border-l border-border bg-card transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
        <h2 className="text-sm font-medium">AI design assistant</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close AI design assistant"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <Sparkles className="size-5 text-muted-foreground" aria-hidden />
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
          The AI design assistant will generate and revise this project&apos;s
          architecture here.
        </p>
      </div>
    </aside>
  );
}
