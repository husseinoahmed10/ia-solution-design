/** How the signed-in user reaches a project. Only an owner may rename or delete. */
export type ProjectAccess = "owner" | "collaborator";

/**
 * The shape the sidebar and the dialogs need to identify and label a project.
 *
 * `id` is the project's only identifier: it is the workspace route segment and
 * the Liveblocks room ID as well as the database key. There is deliberately no
 * slug and no derived suffix, so a rename cannot change how a project is
 * addressed.
 */
export interface ProjectSummary {
  id: string;
  name: string;
  access: ProjectAccess;
}
