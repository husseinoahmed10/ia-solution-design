import { Workflow } from "lucide-react";

/**
 * The centre of the workspace, where the architecture canvas will be mounted.
 *
 * It fills the canvas region and sits on `--background`, so the navbar and the
 * two `--card` side panels read as chrome layered over it. No canvas library and
 * no React Flow are involved in this unit — this is the space they will occupy.
 */
export function CanvasPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <Workflow className="size-6 text-muted-foreground" aria-hidden />
      <p className="max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
        The architecture canvas will appear here.
      </p>
    </div>
  );
}
