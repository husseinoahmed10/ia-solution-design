"use client";

import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AiChatComposerProps {
  draft: string;
  onDraftChange: (draft: string) => void;
  /**
   * Submits the draft. **It must not reach a model or an API in this unit** —
   * the controller above appends the message to its own local list and nothing
   * more.
   */
  onSubmitDraft: () => void;
}

/**
 * The chat input.
 *
 * The draft is passed in rather than held here, because Radix `Tabs` unmounts
 * the inactive panel and a half-typed message should survive a look at `Specs`.
 * See `hooks/use-ai-architect-chat.ts`.
 *
 * It grows with what is typed between roughly 72px and 160px and then scrolls,
 * which is the `Textarea` primitive's own `field-sizing-content` bounded by a
 * minimum and a maximum rather than a height measured in JavaScript. The native
 * resize grip is dropped so there are not two mechanisms sizing one box.
 *
 * `Enter` submits and `Shift+Enter` inserts a newline, so a multi-line
 * description is still typable in a field whose primary action is send.
 */
export function AiChatComposer({
  draft,
  onDraftChange,
  onSubmitDraft,
}: AiChatComposerProps) {
  return (
    <form
      className="flex shrink-0 items-end gap-2 border-t border-border pt-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmitDraft();
      }}
    >
      <Textarea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={(event) => {
          /*
           * Shift+Enter is a newline, and an Enter closing an IME candidate list
           * belongs to the composition — neither submits.
           */
          if (
            event.key !== "Enter" ||
            event.shiftKey ||
            event.nativeEvent.isComposing
          ) {
            return;
          }

          event.preventDefault();
          onSubmitDraft();
        }}
        aria-label="Message the AI Architect"
        placeholder="Describe the solution to design…"
        className="max-h-40 min-h-18 resize-none overflow-y-auto"
      />

      <Button
        type="submit"
        size="icon"
        aria-label="Send message"
        disabled={!draft.trim()}
      >
        <SendHorizontal />
      </Button>
    </form>
  );
}
