import { Bot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AI_ARCHITECT_STARTER_PROMPTS } from "@/features/ai-workspace/ai-architect-prompts";
import { AiChatComposer } from "@/features/ai-workspace/ai-chat-composer";
import { AiChatMessageBubble } from "@/features/ai-workspace/ai-chat-message";
import type { AiArchitectChatController } from "@/hooks/use-ai-architect-chat";

interface AiArchitectPanelProps {
  chat: AiArchitectChatController;
}

/**
 * The `AI Architect` tab: a scrollable conversation over the chat input.
 *
 * **There is no AI here yet.** Submitting appends the message to the
 * controller's local list and nothing generates a reply: no provider, no route,
 * no streaming, and no write to Liveblocks, Presence, or PostgreSQL.
 *
 * The starter prompts are `disabled`, following the convention the navbar
 * already uses: an action whose behaviour is not implemented yet is rendered
 * visibly not ready rather than wired to a no-op. They are suggestions of what
 * the AI Architect will be asked, not controls.
 */
export function AiArchitectPanel({ chat }: AiArchitectPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {chat.messages.length > 0 ? (
        <ScrollArea className="min-h-0 flex-1">
          <ul className="flex flex-col gap-2 pr-2">
            {chat.messages.map((message) => (
              <AiChatMessageBubble key={message.id} message={message} />
            ))}
          </ul>
        </ScrollArea>
      ) : (
        /*
         * The empty state replaces the scroll area rather than sitting inside
         * it. Radix wraps a viewport's children in a `display: table` element,
         * where a percentage height does not resolve, so a centred column in
         * there would collapse to its own height at the top of the panel.
         */
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-2 text-center">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-surface">
            <Bot className="size-5 text-primary" aria-hidden />
          </div>

          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            The AI Architect will help you design this project&apos;s IA
            solution — the components, the connections between them, and the
            reasoning behind the split.
          </p>

          <ul className="flex flex-col items-center gap-1.5">
            {AI_ARCHITECT_STARTER_PROMPTS.map((starterPrompt) => (
              <li key={starterPrompt}>
                <Button variant="outline" size="xs" disabled>
                  {starterPrompt}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AiChatComposer
        draft={chat.draft}
        onDraftChange={chat.setDraft}
        onSubmitDraft={chat.submitDraft}
      />
    </div>
  );
}
