/** How the signed-in user reaches a project. Only an owner may rename or delete. */
export type ProjectAccess = "owner" | "collaborator";

/** The shape the sidebar and the dialogs need to identify and label a project. */
export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  access: ProjectAccess;
}
