"use client";

import { LayoutTemplate } from "lucide-react";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StarterTemplatePreview } from "@/features/canvas/starter-template-preview";
import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
} from "@/features/canvas/starter-templates";

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Called with the chosen template. What importing *means* — replacing the
   * collaborative canvas as one undoable operation and fitting the result into view
   * — belongs to the canvas, which is the only thing holding the room's state, so
   * this modal knows nothing about it. It picks a template and hands it over.
   */
  onImport: (template: CanvasTemplate) => void;
}

/**
 * The starter template picker.
 *
 * A catalogue and nothing more: it lists the templates from `CANVAS_TEMPLATES`, and
 * it holds **no state of its own** — not which template is highlighted, not a copy
 * of the library, and not whether it is open, which is owned above it so the navbar
 * can open it from outside the canvas.
 *
 * Choosing a template imports it immediately and closes the dialog, with no
 * confirmation step in between, because the import is a single undoable
 * operation — one Undo restores the architecture that was there before, which is a
 * better answer to a mistaken click than a second dialog is. The button's own label
 * says what it will do.
 *
 * There is no template creating, saving, editing, category, or search here. These
 * are the predefined architectures, read-only.
 */
export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Start from a template"
      description="Import a predefined high-level IA architecture. It replaces what is on the canvas, and one Undo brings it back."
      /*
       * Wider than the default `sm:max-w-md` an editor dialog gets, because the
       * cards carry diagrams: at the default width two of them would be a single
       * column of previews too narrow to read the arrangement in.
       */
      contentClassName="sm:max-w-3xl"
      footer={
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
      }
    >
      {/*
       * The grid scrolls, not the dialog. The height is capped against the viewport
       * so a fourth template added to the library extends the list inside this area
       * rather than pushing the footer off a short screen.
       */}
      <ScrollArea className="max-h-[60vh]">
        <ul className="grid gap-3 sm:grid-cols-2">
          {CANVAS_TEMPLATES.map((template) => (
            <StarterTemplateCard
              key={template.id}
              template={template}
              onImport={onImport}
              onOpenChange={onOpenChange}
            />
          ))}
        </ul>
      </ScrollArea>
    </EditorDialog>
  );
}

/**
 * One template: what it is called, what it does, what it looks like, and the button
 * that imports it.
 *
 * The card is the shared `Card` primitive, so it carries the interface's own
 * surface, radius, and footer treatment rather than a canvas-specific panel style.
 */
function StarterTemplateCard({
  template,
  onImport,
  onOpenChange,
}: {
  template: CanvasTemplate;
  onImport: (template: CanvasTemplate) => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <li>
      <Card size="sm" className="h-full">
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>

        <CardContent>
          {/*
           * The fixed preview area. Its height is fixed and its width is the card's,
           * so every diagram is scaled into the same space and the templates can be
           * compared; the preview itself letterboxes inside it rather than
           * stretching. The panel sits on the page background rather than the card
           * surface, so it reads as a window onto a canvas.
           */}
          <div className="h-32 w-full overflow-hidden rounded-lg border border-border bg-background p-1">
            <StarterTemplatePreview template={template} />
          </div>
        </CardContent>

        {/*
         * `mt-auto` with the card at `h-full`, so the buttons of two cards in a row
         * line up even when one description wraps to a second line.
         */}
        <CardFooter className="mt-auto">
          <Button
            className="w-full"
            onClick={() => {
              onImport(template);
              onOpenChange(false);
            }}
          >
            <LayoutTemplate data-icon="inline-start" />
            {/*
             * The template's name is in the accessible name as well as the visible
             * label, because three buttons reading "Use template" are indistinguishable
             * to somebody listing the dialog's controls.
             */}
            <span className="sr-only">{`Use the ${template.name} template`}</span>
            <span aria-hidden>Use template</span>
          </Button>
        </CardFooter>
      </Card>
    </li>
  );
}
