# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js 16, React 19, TypeScript | Full-stack web application |
| UI | Tailwind CSS, shadcn/ui, Lucide React | Styling and reusable interface components |
| Canvas | `@xyflow/react` | Interactive solution architecture canvas |
| Authentication | Clerk | User sign-in and route protection |
| Collaboration | Liveblocks | Project workspace rooms, keyed by project ID |
| Database | PostgreSQL with Prisma | Projects, documents, requirements, designs, findings, and output metadata |
| File storage | Vercel Blob | Uploaded source files and generated build-pack files |
| Background jobs | Trigger.dev | Document extraction, AI generation, validation, and build-pack tasks |
| AI | Vercel AI SDK with Google Gemini | Structured requirement and design generation |
| Validation | Zod | Runtime validation for API input, task payloads, stored JSON, and AI output |
| Document parsing | `pdfjs-dist`, `mammoth`, `exceljs` | PDF, DOCX, and XLSX text extraction |
| Markdown | `react-markdown` | Build-pack preview in the application |
| Testing | Vitest and Playwright | Unit, integration, and end-to-end tests |

Authentication, storage, and AI calls must be isolated behind small service modules so they can be replaced later if SS&C requires different providers.

## System Boundaries

- `app/` — routes, layouts, server components, and route handlers.
- `components/` — reusable UI and feature components. Do not place database or provider logic here.
- `features/` — project, document, requirement, canvas, standards, and build-pack domain logic.
- `lib/` — shared infrastructure such as Prisma, authentication, storage, AI, and validation helpers.
- `trigger/` — long-running Trigger.dev tasks only.
- `prisma/` — database schema and migrations.
- `context/` — persistent project context and feature specifications.

## Storage Model

- **PostgreSQL** stores structured data and relationships: projects, users, document metadata, extracted sections, requirements, requirement sources, architecture versions, components, connections, findings, task runs, and generated-output metadata.
- **Vercel Blob** stores original uploaded files and generated Markdown or JSON files.
- Large files are not stored directly in PostgreSQL.
- The database stores the blob URL, file name, checksum, size, type, and project relationship.

## Authentication and Access

- Every protected page and mutation requires an authenticated Clerk user.
- Every project has an owner.
- Project access is checked on the server before reading or changing project data.
- Browser-supplied project IDs are never trusted without a server-side access check.

### Clerk wiring

- `ClerkProvider` wraps the root layout from inside `<body>`, which the Next.js SDK requires.
- `proxy.ts` at the project root holds `clerkMiddleware`. Next.js 16 renamed `middleware.ts` to `proxy.ts`; there is no `middleware.ts`.
- The proxy is **protected-first**: it calls `auth.protect()` for every page path that is not a public auth path, so a new page route is protected without editing the proxy.
- `lib/auth-routes.ts` is the single source for the public paths. It reads `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` so the proxy, the `/` redirect, and Clerk's own redirects cannot drift apart.
- **`/api` is excluded from `auth.protect()` and is not public.** `protect()` only redirects a request Clerk recognises as a page — it inspects `Sec-Fetch-Dest` and `Accept` — and answers anything else by rewriting to a 404. Under the proxy, an unauthenticated API call would return `404` and no handler would run, so `401` would be unreachable. `isApiPath()` in `lib/auth-routes.ts` marks these paths, and every route handler authenticates itself. A route handler added later inherits no protection from the proxy.
- The proxy is the coarse gate only. Clerk deprecated `createRouteMatcher` because path matching in a proxy can diverge from how Next.js resolves a request, so it does not replace the server-side access checks required by invariant 6. Read auth with `await auth()` in the page, layout, route handler, or server function that touches protected data.

### Route handler conventions

- Read the caller with `getRequestUserId()` from `lib/api-auth.ts`. No signed-in user is `401`.
- Validate the body with a Zod schema from the feature module. A malformed or invalid payload is `400`.
- Check access before mutating. A project that does not exist is `404`; one owned by another user is `403`. Scope the mutation by `ownerId` as well, so the statement cannot touch another user's row if ownership changes between the check and the write.
- Return JSON through the helpers in `lib/api-response.ts`, so every error shares the `{ error }` shape. `201` for a create, `204` with no body for a delete.
- Select an explicit field list for responses rather than returning a Prisma model, so a column added later is private until it is deliberately exposed.
- `/` owns no content. It reads `await auth()` and redirects to `/editor` when authenticated and to the sign-in path when not.
- Required environment variables: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, and `NEXT_PUBLIC_CLERK_SIGN_UP_URL`. Do not rename or add to these.

## Project Workspace Identity

- **A project has exactly one identifier: its `Project.id`.** That same value is the workspace route segment (`/editor/[projectId]`) and the Liveblocks room ID. The three can never drift apart because there is only one of them.
- **Identifiers are never derived from a project name.** There are no slugs and no short unique suffixes anywhere in the application. A rename therefore changes the name only — the ID, the route, and the room are untouched — and there is no rename operation on a room.
- The ID is assigned by the database (`@default(uuid(7))`), so a create writes the row first and names the room from the returned ID. Application code generates no identifiers.
- **Liveblocks is reached only through `lib/liveblocks.ts`**, per the isolation rule above. The client is built on first use rather than at import, so a missing key fails the request that needs it instead of the build.
- Creating a project creates its room; deleting a project deletes its room. A create whose room fails deletes the project row again, so no response reports a workspace the user cannot open. A delete removes the room first, because once the row is gone nothing records which room belonged to it.
- Required environment variable: `LIVEBLOCKS_SECRET_KEY`. `LIVEBLOCKS_BASE_URL` is optional and only points the client at an alternative server.

## Background and AI Model

- Normal request handlers validate input, check access, create task records, and trigger work.
- Long-running document extraction, AI generation, standards review, and build-pack generation run in Trigger.dev.
- Trigger.dev tasks receive IDs and references, not unrestricted client state.
- AI returns structured data validated with Zod before persistence.
- The application database is the source of truth; Markdown is a generated output.

## Core Domain Records

The initial domain will use these main records:

- `Project`
- `SourceDocument`
- `SourceSection`
- `Requirement`
- `RequirementSource`
- `OpenQuestion`
- `RequirementConflict`
- `ArchitectureVersion`
- `ArchitectureComponent`
- `ArchitectureConnection`
- `ComplianceFinding`
- `GeneratedOutput`
- `TaskRun`

Add fields and supporting records in the relevant feature specification rather than designing the entire schema in advance.

## Invariants

1. Request handlers must not perform long-running extraction or AI work.
2. Every requirement must retain at least one source reference unless it is explicitly marked as an assumption.
3. Every material architecture component must link to at least one confirmed requirement.
4. AI output must be validated before it is stored or applied to the canvas.
5. Approved architecture versions are immutable; changes create a new draft version.
6. Project access must be enforced server-side at every read and mutation boundary.
7. The application must not invent WorkHQ capabilities, Blue Prism capabilities, business rules, or SS&C standards.
8. The MVP generates designs and specifications only; it does not deploy WorkHQ or Blue Prism assets.
