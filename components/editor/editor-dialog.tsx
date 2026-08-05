"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EditorDialogProps
  extends React.ComponentProps<typeof Dialog> {
  title: string;
  description?: ReactNode;
  /** Actions rendered in the footer, usually cancel plus a primary action. */
  footer?: ReactNode;
  /** Optional trigger, composed with `asChild`. */
  trigger?: ReactNode;
  contentClassName?: string;
}

/**
 * Shared shape for every editor dialog: a title, an optional description, an
 * optional body, and optional footer actions. Colours come from the shadcn/ui
 * primitives, which read the tokens in `app/globals.css`.
 */
export function EditorDialog({
  title,
  description,
  footer,
  trigger,
  contentClassName,
  children,
  ...dialogProps
}: EditorDialogProps) {
  return (
    <Dialog {...dialogProps}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className={cn("sm:max-w-md", contentClassName)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
