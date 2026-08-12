import { currentUser } from "@clerk/nextjs/server";

/**
 * Who is asking. `userId` identifies an owner; `primaryEmail` is what a
 * collaborator is matched on, because there is no local user table to relate a
 * `ProjectCollaborator` row to and an invitee may not have signed up yet.
 *
 * The email is nullable: a Clerk user is not guaranteed to have a primary
 * address, and a missing one must narrow access rather than widen it.
 */
export interface CurrentIdentity {
  userId: string;
  primaryEmail: string | null;
}

/**
 * The signed-in Clerk user, reduced to the two values an access decision needs,
 * or `null` when there is no session.
 *
 * `currentUser()` rather than `auth()`, because `auth()` carries no email
 * address and a collaborator is identified by one. It costs a Backend API call,
 * so a caller that only needs the user ID should use `getRequestUserId()`
 * instead. Clerk dedupes this call per request, so reading it from more than one
 * place in a single render or request is one call.
 *
 * The email is lower-cased here, which is the **one** place it is normalised on
 * the read side: `ProjectCollaborator.email` is stored lower-cased by
 * `inviteCollaboratorSchema`, and a Postgres comparison is case-sensitive, so a
 * mixed-case address from Clerk would silently match no rows.
 */
export async function getCurrentIdentity(): Promise<CurrentIdentity | null> {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const primaryEmail = user.primaryEmailAddress?.emailAddress ?? null;

  return {
    userId: user.id,
    primaryEmail: primaryEmail ? primaryEmail.trim().toLowerCase() : null,
  };
}
