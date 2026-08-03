"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  className?: string;
}

/**
 * Fixed-height chrome across the top of every editor screen. The centre and
 * right sections are intentionally empty until later units fill them.
 */
export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  className,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3",
        className
      )}
    >
      <div className="flex flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? "Close projects" : "Open projects"}
          onClick={onToggleSidebar}
        >
          <SidebarIcon />
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center gap-2" />

      <div className="flex flex-1 items-center justify-end gap-2" />
    </header>
  );
}
