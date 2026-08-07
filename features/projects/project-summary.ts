import type { ProjectRecord } from "@/features/projects/project-service";
import type {
  ProjectAccess,
  ProjectSummary,
} from "@/features/projects/project-types";

/**
 * Narrows a project record to what the sidebar and the dialogs need, and tags it
 * with how the signed-in user reaches it.
 *
 * Access is not stored on the project — it is decided by *which* query returned
 * the row — so it is attached here rather than read from a field.
 */
export function toProjectSummary(
  project: Pick<ProjectRecord, "id" | "name">,
  access: ProjectAccess
): ProjectSummary {
  return { id: project.id, name: project.name, access };
}
