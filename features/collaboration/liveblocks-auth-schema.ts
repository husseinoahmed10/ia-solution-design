import { z } from "zod";

/**
 * A room ID is a `Project.id`, which the schema generates with
 * `@default(uuid(7))`. The length cap is a guard on an untrusted value rather than
 * a format check — the ID is only ever used to look a project up through the access
 * check, which is what actually decides whether it is real.
 */
const ROOM_ID_MAX_LENGTH = 64;

/**
 * `POST /api/liveblocks-auth`.
 *
 * The Liveblocks client posts `{ room }`, so the field is named for the caller
 * rather than for the project it identifies. It is required: a request with no room
 * is a `400`, because a session must be scoped to exactly one workspace and there
 * is nothing sensible to authorise without one.
 */
export const liveblocksAuthSchema = z.object({
  room: z
    .string()
    .trim()
    .min(1, { message: "A room is required." })
    .max(ROOM_ID_MAX_LENGTH, { message: "That room is not a valid room." }),
});

export type LiveblocksAuthInput = z.infer<typeof liveblocksAuthSchema>;
