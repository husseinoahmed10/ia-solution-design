import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { CanvasRoom } from "@/features/collaboration/canvas-room";
import { SIGN_IN_URL } from "@/lib/auth-routes";
import { resolveProjectAccess } from "@/lib/project-access";

/**
 * A project workspace.
 *
 * A Server Component, so the access check runs before anything renders and no
 * project data reaches the browser for a project the user may not open.
 *
 * `projectId` arrives from the URL, so it is caller-supplied and untrusted: the
 * project is loaded through `resolveProjectAccess`, which lives in
 * `lib/project-access.ts` rather than here (`architecture.md`, invariant 6). A
 * project that does not exist and one the user may not open both render
 * `AccessDenied`, so the route cannot be used to discover that somebody else's
 * project exists.
 *
 * The chrome around this — the navbar, the project sidebar, and the AI panel —
 * comes from the `(editor)` layout, so this page contributes the canvas region
 * only: the collaborative canvas, and the Liveblocks room it lives in.
 *
 * The room is entered from `CanvasRoom`, on the client, because joining a room is
 * a browser concern. The project ID this page already validated is what it is
 * given, and that same ID is the room ID.
 */
export default async function ProjectWorkspacePage({
  params,
}: PageProps<"/editor/[projectId]">) {
  const { projectId } = await params;
  const access = await resolveProjectAccess(projectId);

  if (access.status === "unauthenticated") {
    redirect(SIGN_IN_URL);
  }

  if (access.status === "denied") {
    return <AccessDenied />;
  }

  return <CanvasRoom projectId={access.project.id} />;
}
