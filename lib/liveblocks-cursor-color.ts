/**
 * The colour that identifies one user in a project workspace.
 *
 * These are literal hex values rather than references to the palette in
 * `app/globals.css`, because a cursor colour is **data**: it is attached to a
 * Liveblocks session on the server and travels to every other client, where it is
 * applied as an inline colour to that user's cursor and avatar ring. A
 * `var(--token)` reference could not survive that trip, and the set has to be
 * larger than the interface palette so two people in a room are told apart.
 *
 * The values are deliberately distinct from `--primary`, `--success`,
 * `--warning`, and `--destructive`, so a collaborator's colour is never mistaken
 * for the accent or for a status.
 */
const CURSOR_COLORS = [
  "#60A5FA",
  "#A78BFA",
  "#F472B6",
  "#FB923C",
  "#FBBF24",
  "#34D399",
  "#22D3EE",
  "#A3E635",
] as const;

/**
 * FNV-1a over the user ID.
 *
 * A sum of character codes would be a poor choice here: Clerk user IDs share a
 * long `user_` prefix and draw from a narrow alphabet, so a sum clusters and
 * neighbouring IDs collide. FNV-1a mixes every character into the whole word, so
 * the palette is used evenly.
 *
 * `Math.imul` keeps the multiply in 32 bits and `>>> 0` returns it unsigned, so
 * the result is a stable non-negative integer rather than a platform-dependent
 * float.
 */
function hashUserId(userId: string): number {
  let hash = 2166136261;

  for (let index = 0; index < userId.length; index += 1) {
    hash ^= userId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

/**
 * The cursor colour for a Clerk user ID.
 *
 * Deterministic and stateless: the same user is the same colour in every room, in
 * every session, and on every client, with nothing stored and nothing to
 * reconcile. Two users in one room can still collide — the palette is finite —
 * which is why a name accompanies the colour everywhere it is shown.
 */
export function cursorColorForUserId(userId: string): string {
  return CURSOR_COLORS[hashUserId(userId) % CURSOR_COLORS.length];
}
