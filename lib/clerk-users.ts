import { clerkClient } from "@clerk/nextjs/server";

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
