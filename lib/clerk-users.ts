import { clerkClient, currentUser } from "@clerk/nextjs/server";

/**
 * Clerk user lookup by email address.
 *
 * Clerk owns the user store — there is no local `User` table — so a
 * `ProjectCollaborator` row holds an email and nothing else. This adapter is the
 * only place that turns those emails into display names and avatars, per the
 * provider-isolation rule in `architecture.md`.
 */

/** The presentational fields a collaborator row needs. Both may be absent. */
export interface ClerkUserProfile {
  displayName: string | null;
  imageUrl: string | null;
}

/**
 * How the current user is presented to the other people in a room. Unlike
 * `ClerkUserProfile`, `displayName` is **not** nullable: a cursor with no label
 * beside it is unusable, so a name is always resolved, if necessary from the
 * user ID.
 */
export interface CurrentUserProfile {
  displayName: string;
  imageUrl: string | null;
}

/**
 * The last resort for a display name.
 *
 * A Clerk user is not guaranteed to have a name, a username, or an email address,
 * and the local part of an address is used before this — so this is reached only
 * by an account carrying no human-readable field at all. It is deliberately the
 * ID rather than a shared word like "Anonymous", so two such users are still told
 * apart in a room.
 */
function fallbackDisplayName(userId: string): string {
  return `User ${userId.slice(-6)}`;
}

/**
 * The signed-in user's display name and avatar, or `null` when there is no
 * session.
 *
 * The name walks Clerk's own fields in order of how human-readable they are —
 * full name, username, then the local part of the primary email address — before
 * falling back to a fragment of the user ID. Nothing is invented and nothing comes
 * from this application's database: the fallback is always *some* value Clerk
 * already holds, as the specification requires.
 *
 * An empty-string `imageUrl` becomes `null`, so a caller renders an initial rather
 * than requesting an image that does not exist. `||` rather than `??` for exactly
 * that reason — Clerk returns `""`, not `null`, for an absent image.
 *
 * This lives beside `findUserProfilesByEmail` because both ask Clerk who somebody
 * is, which `architecture.md` confines to this module.
 */
export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email = user.primaryEmailAddress?.emailAddress ?? null;
  const emailLocalPart = email ? email.split("@")[0] : null;

  const displayName =
    user.fullName?.trim() ||
    user.username?.trim() ||
    emailLocalPart?.trim() ||
    fallbackDisplayName(user.id);

  return {
    displayName,
    imageUrl: user.imageUrl || null,
  };
}

/** Clerk accepts at most 100 email addresses per `getUserList` filter. */
const EMAIL_FILTER_LIMIT = 100;

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

/**
 * Clerk profiles for the given email addresses, keyed by **lower-cased** email.
 *
 * An address with no Clerk account is simply absent from the map: an invitee may
 * never have signed up, which is a normal state rather than an error, and the
 * caller falls back to showing the email alone.
 *
 * The map is built from each returned user's *own* addresses rather than from the
 * addresses that were asked for, so a lookup can only ever hit an exact match.
 * That matters because Clerk documents the `emailAddress` filter as a
 * case-insensitive **partial** match, which can return users this caller did not
 * ask about — they land in the map under their real addresses and are never read.
 *
 * A Clerk failure resolves to an empty map rather than throwing. The collaborator
 * list is stored in this application's own database, so an enrichment outage
 * degrades the dialog to email-only — the same fallback an unregistered invitee
 * already takes — instead of hiding who has access.
 */
export async function findUserProfilesByEmail(
  emails: string[]
): Promise<Map<string, ClerkUserProfile>> {
  const profiles = new Map<string, ClerkUserProfile>();

  if (emails.length === 0) {
    return profiles;
  }

  try {
    const clerk = await clerkClient();

    for (const emailChunk of chunk(emails, EMAIL_FILTER_LIMIT)) {
      const { data: users } = await clerk.users.getUserList({
        emailAddress: emailChunk,
        limit: EMAIL_FILTER_LIMIT,
      });

      for (const user of users) {
        const profile: ClerkUserProfile = {
          displayName: user.fullName ?? user.username ?? null,
          imageUrl: user.imageUrl || null,
        };

        for (const { emailAddress } of user.emailAddresses) {
          profiles.set(emailAddress.trim().toLowerCase(), profile);
        }
      }
    }
  } catch {
    /*
     * Deliberately swallowed: enrichment is presentational. Returning what has
     * been collected so far leaves every unresolved address on the email-only
     * fallback the specification already defines.
     */
  }

  return profiles;
}
