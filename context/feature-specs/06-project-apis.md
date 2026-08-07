The database schema is ready. Build the backend project API routes only.

## Routes

Create REST endpoints for:

- `GET /api/projects` — list the current user’s projects
- `POST /api/projects` — create a project
- `PATCH /api/projects/[projectId]` — rename a project
- `DELETE /api/projects/[projectId]` — delete a project

## Rules

Use the authenticated Clerk user ID as `ownerId`.

When creating:

- default a missing or empty project name to `Untitled Project`
- use the schema’s existing ID strategy
- do not add sequential IDs

Security:

- unauthenticated requests return `401`
- only the project owner can rename or delete a project
- non-owner mutations return `403`

Keep this backend-only. Do not wire the UI yet.

Do not add collaborator, shared-project, canvas, or document APIs yet.

## Check When Done

- routes exist for list, create, rename, and delete
- listing returns only projects owned by the current user
- owner checks are enforced for rename and delete
- `401` and `403` responses are handled correctly
- missing or empty names default to `Untitled Project`
- `npm run build` passes