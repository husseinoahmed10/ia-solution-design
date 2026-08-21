import { Loader2, WifiOff } from "lucide-react";

/**
 * What the canvas region shows while a Liveblocks room is being joined, and what
 * it shows when joining it failed.
 *
 * Both live here rather than inside the room wrapper because they are the two
 * non-canvas states of the same region and read as a pair: same centred column,
 * same `--background` surface, differing only in icon and message. Neither holds
 * state, so both are Server Components even though their only caller is a client
 * component.
 */

/**
 * Shown while the room connects and Storage loads.
 *
 * Deliberately plain — a spinner and a line, not a skeleton of an empty canvas,
 * which would only be a grid of dots and would look like a loaded canvas.
 */
export function CanvasLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
      <p
        role="status"
        className="text-sm leading-relaxed text-pretty text-muted-foreground"
      >
        Connecting to the canvas…
      </p>
    </div>
  );
}

/**
 * Shown when the room cannot be joined at all.
 *
 * This is a *permanent* failure, not a dropped connection: Liveblocks retries a
 * transient problem by itself and the loading state above covers that, so this
 * screen appears only when it has stopped retrying — a refused token, a room the
 * session may not enter, or a server with no `LIVEBLOCKS_SECRET_KEY`.
 *
 * Without it a refusal would be invisible. `waitUntilStorageReady` loops until
 * Storage loads, so a room that can never connect would otherwise leave the
 * loading state above on screen indefinitely with the reason only in the console.
 *
 * The message names no cause. The reason lives on the server, and the useful
 * action is the same either way, so guessing between "you lost access" and "the
 * server is misconfigured" would only mislead.
 */
export function CanvasConnectionError() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <WifiOff className="size-5 text-muted-foreground" aria-hidden />

      <p
        role="alert"
        className="max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground"
      >
        The canvas could not be loaded. Check your connection and reload the page.
      </p>
    </div>
  );
}
