Set up the realtime collaboration infrastructure using Liveblocks.

Liveblocks credentials have not been configured yet.

## Configuration

Configure `liveblocks.config.ts` at the project root.

Define:

### Presence

* cursor position
* `isThinking` boolean

### UserMeta

* user ID
* display name
* avatar URL
* cursor color

The project ID is the Liveblocks room ID.

## Liveblocks Client

Create a cached Liveblocks Node client in `lib`.

Configure it to read:

```text
process.env.LIVEBLOCKS_SECRET_KEY
```

The real Liveblocks secret will be configured manually later.

Do not:

* add a placeholder secret
* hard-code credentials
* modify environment files
* fail application startup or `npm run build` solely because the secret is not currently configured

If Liveblocks server functionality is invoked without `LIVEBLOCKS_SECRET_KEY`, return or throw a clear runtime configuration error.

Add a helper that deterministically maps a Clerk user ID to a consistent color from a fixed palette.

## Auth Route

Create:

```text
POST /api/liveblocks-auth
```

Use the project ID as the Liveblocks room ID.

This route must:

1. require Clerk authentication
2. read the requested room ID
3. verify project access using the existing project access helper
4. allow access when the user is the project owner or an existing collaborator
5. ensure the Liveblocks room exists, creating it only if needed
6. create new rooms as private rooms with no default public access
7. create the Liveblocks session using the Clerk user ID
8. grant write access only to the requested project room
9. attach user metadata to the session:

   * display name
   * avatar URL
   * deterministic cursor color
10. authorize the session and return the Liveblocks response

Use Clerk user data for the display name and avatar.

If a display name or avatar is unavailable, use a sensible fallback based on the authenticated user's available Clerk data.

Return `401` for unauthenticated requests.

Return `403` for unauthorized project access.

Do not grant wildcard access to other IA Solution Design projects.

If `LIVEBLOCKS_SECRET_KEY` is not configured and the auth route is called, return a clear server configuration error.

## Room Identity

Keep the identifiers aligned:

* database project ID = workspace ID = Liveblocks room ID

Renaming a project must not change its Liveblocks room ID.

## Scope

Do not add:

* Liveblocks room providers to the workspace
* realtime cursors
* presence UI
* React Flow canvas storage
* collaborative node or edge state
* AI presence behavior
* comments
* notifications

Do not create or modify any environment files.

This feature only establishes the Liveblocks configuration, server client, user metadata, room creation, and secure authentication infrastructure.

## Dependencies

Use the Liveblocks packages already installed in the project.

Do not add unrelated dependencies.


## Check When Done

- Liveblocks config defines `Presence` and `UserMeta`
- cached Liveblocks client exists
- auth route checks Clerk authentication and project access
- room ID uses the project ID
- user metadata is attached to the session
- unauthorized access returns `403`
- missing `LIVEBLOCKS_SECRET_KEY` is handled clearly at runtime
- `npm run build` passes