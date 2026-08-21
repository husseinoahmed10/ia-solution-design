import type {
  CollaboratorListResponse,
  CollaboratorSummary,
} from "@/features/collaborators/collaborator-types";
import type { ApiErrorBody } from "@/lib/api-response";

/**
 * Browser-side calls to the collaborator routes.
 *
 * It mirrors `features/projects/project-client.ts`: a failed request is a returned
 * value rather than a thrown exception, so the dialog always has something to
 * render, and the error body is read defensively because a non-JSON failure has
 * nothing to parse.
 */

type ListResult =
  | { ok: true; list: CollaboratorListResponse }
  | { ok: false; error: string };

type InviteResult =
  | { ok: true; collaborator: CollaboratorSummary }
  | { ok: false; error: string };

type RemoveResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (
      body &&
      typeof body === "object" &&
      typeof (body as ApiErrorBody).error === "string"
    ) {
      return (body as ApiErrorBody).error;
    }
  } catch {
    // An unparseable error body is expected for a non-JSON failure.
  }

  return GENERIC_ERROR;
}

function collaboratorsPath(projectId: string): string {
  return `/api/projects/${encodeURIComponent(projectId)}/collaborators`;
}

/**
 * `GET /api/projects/[projectId]/collaborators`. The response carries `canManage`,
 * so the dialog learns from the server whether to offer the owner controls rather
 * than deciding for itself.
 */
export async function fetchCollaborators(
  projectId: string
): Promise<ListResult> {
  try {
    const response = await fetch(collaboratorsPath(projectId));

    if (!response.ok) {
      return { ok: false, error: await readErrorMessage(response) };
    }

    return { ok: true, list: (await response.json()) as CollaboratorListResponse };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** `POST /api/projects/[projectId]/collaborators`. */
export async function inviteCollaborator(
  projectId: string,
  email: string
): Promise<InviteResult> {
  try {
    const response = await fetch(collaboratorsPath(projectId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      return { ok: false, error: await readErrorMessage(response) };
    }

    const { collaborator } = (await response.json()) as {
      collaborator: CollaboratorSummary;
    };

    return { ok: true, collaborator };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

/**
 * `DELETE /api/projects/[projectId]/collaborators/[collaboratorId]`. Answers
 * `204`, so there is no body.
 */
export async function removeCollaborator(
  projectId: string,
  collaboratorId: string
): Promise<RemoveResult> {
  try {
    const response = await fetch(
      `${collaboratorsPath(projectId)}/${encodeURIComponent(collaboratorId)}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      return { ok: false, error: await readErrorMessage(response) };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}
