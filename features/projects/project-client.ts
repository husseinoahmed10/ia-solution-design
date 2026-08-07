import type { ProjectRecord } from "@/features/projects/project-service";
import type { ApiErrorBody } from "@/lib/api-response";

/**
 * Browser-side calls to the project routes.
 *
 * It exists so the mutation hook holds no `fetch` or JSON handling and so every
 * caller gets the same result shape: a failed request is a value to render, not
 * a thrown exception. Only the fields a client may see cross this boundary —
 * these are the same `ProjectRecord`s the routes return.
 */

type ProjectResult =
  | { ok: true; project: ProjectRecord }
  | { ok: false; error: string };

type DeleteResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

/**
 * The `{ error }` message the route sent, or a generic fallback.
 *
 * A route that fails before it can answer JSON — or a network error — leaves
 * nothing to parse, so the body is read defensively rather than assumed.
 */
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

async function readProject(response: Response): Promise<ProjectResult> {
  if (!response.ok) {
    return { ok: false, error: await readErrorMessage(response) };
  }

  const { project } = (await response.json()) as { project: ProjectRecord };

  return { ok: true, project };
}

/**
 * `POST /api/projects`. The response carries the project ID the server
 * generated, which is also the ID of the workspace room it created.
 */
export async function createProject(name: string): Promise<ProjectResult> {
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    return await readProject(response);
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** `PATCH /api/projects/[projectId]`. The project ID is unchanged by a rename. */
export async function renameProject(
  projectId: string,
  name: string
): Promise<ProjectResult> {
  try {
    const response = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }
    );

    return await readProject(response);
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** `DELETE /api/projects/[projectId]`. Answers `204`, so there is no body. */
export async function deleteProject(projectId: string): Promise<DeleteResult> {
  try {
    const response = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}`,
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
