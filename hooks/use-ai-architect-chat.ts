"use client";

import { useCallback, useRef, useState } from "react";

import type { AiChatMessage } from "@/features/ai-workspace/ai-chat-message";

export interface AiArchitectChatController {
  messages: AiChatMessage[];
  /** What is currently in the composer. */
  draft: string;
  setDraft: (draft: string) => void;
  /**
   * Appends the trimmed draft as a user message and clears the field. A blank
   * draft is ignored.
   *
   * **It calls nothing.** No provider, no route, no streaming, and no reply — a
   * submitted message only becomes visible locally.
   */
  submitDraft: () => void;
}

/**
 * Owns the AI Architect's temporary conversation and its input.
 *
 * Everything here is **client-local and deliberately unpersisted**: nothing
 * reaches Liveblocks Storage, Presence — `isThinking` is still unused — or
 * PostgreSQL, so the conversation is lost when the AI workspace unmounts. That
 * is correct for this unit; a stored conversation is a later one.
 *
 * It is mounted in `AiSidebar` rather than inside the `AI Architect` tab because
 * Radix `Tabs` **unmounts** the inactive panel: state held in the tab itself
 * would be discarded every time the user looked at `Specs` and came back.
 */
export function useAiArchitectChat(): AiArchitectChatController {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  /*
   * A per-mount counter rather than `Date.now()` or a random value: the ID is
   * only a React key for a list that exists in this one browser, so it needs to
   * be unique here and nothing more. Unlike a canvas node ID — a key in a
   * `LiveMap` two clients write to — there is no second writer to collide with.
   */
  const lastMessageNumber = useRef(0);

  const submitDraft = useCallback(() => {
    const content = draft.trim();
    if (!content) return;

    lastMessageNumber.current += 1;
    const id = `local-${lastMessageNumber.current}`;

    setMessages((currentMessages) => [
      ...currentMessages,
      { id, role: "user", content },
    ]);
    setDraft("");
  }, [draft]);

  return { messages, draft, setDraft, submitDraft };
}
