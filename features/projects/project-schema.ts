import { z } from "zod";

/**
 * The name a project falls back to when the caller sends nothing usable. The
 * create route accepts a missing, empty, or whitespace-only name rather than
 * rejecting it, so the user can create a project and name it later.
 */
export const DEFAULT_PROJECT_NAME = "Untitled Project";

/** Long enough for a descriptive name, short enough to render in the sidebar. */
const PROJECT_NAME_MAX_LENGTH = 120;

const projectName = z.string().trim().max(PROJECT_NAME_MAX_LENGTH, {
  message: `A project name may be at most ${PROJECT_NAME_MAX_LENGTH} characters.`,
});

/**
 * `POST /api/projects`. The name is optional and an empty string is valid;
 * either becomes `DEFAULT_PROJECT_NAME`, so the transform is what applies the
 * default rather than a `.default()` that a present-but-empty value would skip.
 */
export const createProjectSchema = z.object({
  name: projectName
    .optional()
    .transform((name) => (name && name.length > 0 ? name : DEFAULT_PROJECT_NAME)),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * `PATCH /api/projects/[projectId]`. A rename must name the project, so unlike
 * create this rejects a missing or blank value instead of defaulting it — a
 * blank rename would silently discard the existing name.
 */
export const renameProjectSchema = z.object({
  name: projectName.min(1, { message: "A project name is required." }),
});

export type RenameProjectInput = z.infer<typeof renameProjectSchema>;
