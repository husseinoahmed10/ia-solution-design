# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js 16, React 19, TypeScript | Full-stack web application |
| UI | Tailwind CSS, shadcn/ui, Lucide React | Styling and reusable interface components |
| Canvas | `@xyflow/react` | Interactive solution architecture canvas |
| Authentication | Clerk | User sign-in and route protection |
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
- The proxy is **protected-first**: it calls `auth.protect()` for every path that is not a public auth path, so a new route is protected without editing the proxy.
- `lib/auth-routes.ts` is the single source for the public paths. It reads `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` so the proxy, the `/` redirect, and Clerk's own redirects cannot drift apart.
- The proxy is the coarse gate only. Clerk deprecated `createRouteMatcher` because path matching in a proxy can diverge from how Next.js resolves a request, so it does not replace the server-side access checks required by invariant 6. Read auth with `await auth()` in the page, layout, route handler, or server function that touches protected data.
- `/` owns no content. It reads `await auth()` and redirects to `/editor` when authenticated and to the sign-in path when not.
- Required environment variables: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, and `NEXT_PUBLIC_CLERK_SIGN_UP_URL`. Do not rename or add to these.

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
