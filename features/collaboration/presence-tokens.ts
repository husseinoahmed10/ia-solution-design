/**
 * The two dimensions the participant presence group is built from.
 *
 * They live in one module because each is read by **two** components that must
 * agree: the avatar stack and the participant group around it. A number that has
 * to match in two places is exactly what a shared token file is for, in the same
 * way `features/canvas/canvas-*-tokens.ts` holds the canvas' own dimensions.
 *
 * Nothing here is a colour. A collaborator's colour is *data* that arrives with
 * their Liveblocks session — see `lib/liveblocks-cursor-color.ts` — and the group's
 * own surface is expressed in Tailwind classes against the palette, as the other
 * canvas overlays are.
 */

/**
 * How many collaborators are drawn as avatars before the rest are summarised.
 *
 * A stack has to stop somewhere: past five overlapping circles the faces stop
 * being distinguishable and the group starts to crowd the canvas it floats over.
 * The remainder is not dropped — it becomes the `+N` chip — so the count is always
 * complete even when the faces are not.
 */
export const MAX_VISIBLE_COLLABORATOR_AVATARS = 5;

/**
 * The diameter of one avatar in the participant group, collaborator or current
 * user.
 *
 * **It is applied as an inline `width`/`height`, and that is deliberate.** Half of
 * the group is Clerk's `UserButton`, whose markup and stylesheet belong to Clerk:
 * its avatar box can be given a class, but Clerk's own rule is unlayered while
 * Tailwind's utilities sit in a layer, so an unlayered declaration wins and the
 * class would silently lose. An inline style cannot lose that way. Our own avatars
 * then take the same inline value rather than the equivalent utility class, so one
 * number sizes both halves and they cannot drift apart — which is what keeps the
 * collaborators and the current user reading as one row of equals.
 */
export const PRESENCE_AVATAR_SIZE = "1.75rem";
