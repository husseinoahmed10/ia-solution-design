import type { CollaboratorRecord } from "@/features/collaborators/collaborator-service";
import type { CollaboratorSummary } from "@/features/collaborators/collaborator-types";
import { findUserProfilesByEmail } from "@/lib/clerk-users";

/**
 * Enriches stored collaborator rows with the display name and avatar Clerk holds
 * for each address.
 *
 * The database is the authority on *who* has access; Clerk is only asked what to
 * call them. An address with no Clerk account — an invitee who has not signed up
 * yet — keeps `null` for both fields, and the row renders the email alone.
 *
 * One batched lookup covers the whole list rather than a call per row, so the
 * dialog costs a single Backend API request no matter how many collaborators a
 * project has.
 */
export async function toCollaboratorSummaries(
  collaborators: CollaboratorRecord[]
): Promise<CollaboratorSummary[]> {
  if (collaborators.length === 0) {
    return [];
  }

  const profiles = await findUserProfilesByEmail(
    collaborators.map((collaborator) => collaborator.email)
  );

  return collaborators.map((collaborator) => {
    const profile = profiles.get(collaborator.email);

    return {
      id: collaborator.id,
      email: collaborator.email,
      displayName: profile?.displayName ?? null,
      imageUrl: profile?.imageUrl ?? null,
    };
  });
}
