"use client";

import { Panel } from "@xyflow/react";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import type { ComponentType } from "react";

import type { CanvasSnapshotStatus } from "@/hooks/use-canvas-snapshot";
import { cn } from "@/lib/utils";

/**
 * What the background snapshot is doing, in the **top-left corner of the canvas**.
 *
 * Top-left because it is the one corner still free: presence is top-right, the
 * control bar bottom-left, and the component toolbar bottom-centre.
 *
 * **On the canvas rather than in the workspace top bar**, which is where
 * `ui-context.md` used to place save status. It cannot live there: the status is
 * derived from the collaborative nodes and edges, which exist only inside the room,
 * while the navbar is rendered by the editor shell above and outside it. Putting it
 * here keeps it beside the thing it is reporting on anyway.
 *
 * **There is no Save button.** The canvas is already saved: every change is in
 * Liveblocks Storage the moment it is made, and a snapshot is a secondary copy taken
 * automatically. This is a report, not a control, so it has nothing to click.
 *
 * It reports what *this* browser's autosave is doing. The status is local UI state,
 * not presence, so nobody else's indicator moves when this one does.
 */

interface SnapshotStatusPresentation {
  /** The words shown, which are also the accessible announcement. */
  text: string;
  icon: ComponentType<{ "aria-hidden": true; className?: string }>;
  iconClassName?: string;
}

/**
 * How each status is worded and drawn.
 *
 * A map keyed by the status rather than a chain of conditions in the component, so
 * the three states are readable side by side and `idle` is excluded by the type — it
 * renders nothing, so it has no presentation to define.
 */
const SNAPSHOT_STATUS_PRESENTATION: Record<
  Exclude<CanvasSnapshotStatus, "idle">,
  SnapshotStatusPresentation
> = {
  saving: { text: "Saving…", icon: Loader2, iconClassName: "animate-spin" },
  saved: { text: "Saved", icon: Check },
  /*
   * "Save failed" rather than a warning about lost work, because nothing is lost: the
   * canvas is in the room, and the next change takes another snapshot.
   */
  error: { text: "Save failed", icon: TriangleAlert },
};

export function CanvasSnapshotStatusIndicator({
  status,
}: {
  status: CanvasSnapshotStatus;
}) {
  /*
   * A canvas nobody has changed this session shows nothing at all. `Saved` before the
   * first edit would be a claim about a snapshot that was never taken, and an empty
   * corner is the honest state.
   */
  if (status === "idle") {
    return null;
  }

  const {
    text,
    icon: Icon,
    iconClassName,
  } = SNAPSHOT_STATUS_PRESENTATION[status];

  return (
    <Panel position="top-left" className="nodrag nopan nowheel">
      {/*
       * The same floating surface as the canvas' other overlays — a bordered pill on
       * `--card` with a shadow and a backdrop blur — so it reads as one of them. The
       * contents are deliberately quieter than a control's: muted text at the small
       * size, no button, and a failure marked by its icon rather than by a red pill,
       * since an unsaved *snapshot* is not an emergency.
       */}
      <div
        role="status"
        /*
         * Announced when it changes, but not urgently: `polite` waits for a screen
         * reader to finish what it is saying, which an autosave note should never cut
         * into while somebody is reading their diagram.
         */
        aria-live="polite"
        className="flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-2.5 py-1 text-xs text-muted-foreground shadow-lg backdrop-blur"
      >
        <Icon aria-hidden className={cn("size-3.5", iconClassName)} />
        {text}
      </div>
    </Panel>
  );
}
