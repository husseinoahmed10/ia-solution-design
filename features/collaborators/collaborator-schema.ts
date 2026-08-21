import { z } from "zod";

/**
 * The longest address the RFC permits, so a caller cannot push an arbitrarily
 * long string into an indexed column.
 */
const EMAIL_MAX_LENGTH = 254;

/**
 * A collaborator's email address, normalised before it is validated.
 *
 * It is **lower-cased on the way in**, because the address is the collaborator's
 * only identity — there is no local user table to relate to — and a Postgres
 * comparison is case-sensitive. Storing `Bob@Example.com` while Clerk reports
 * `bob@example.com` would leave a row that matches nothing, so the project would
 * never appear in the invitee's `Shared` tab and the `@@unique` constraint would
 * accept the same person twice.
 *
 * `lib/clerk-identity.ts` applies the same normalisation to the address it reads
 * from Clerk, so the two sides of every comparison are lower-cased.
 */
export const collaboratorEmail = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(
    z
      .email({ message: "Enter a valid email address." })
      .max(EMAIL_MAX_LENGTH, { message: "That email address is too long." })
  );

/** `POST /api/projects/[projectId]/collaborators`. */
export const inviteCollaboratorSchema = z.object({
  email: collaboratorEmail,
});

export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;
