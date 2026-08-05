# Code Standards

## General

- Keep modules small and single-purpose.
- Fix the underlying problem rather than adding workarounds.
- Do not mix UI, database, provider, and domain logic in one file.
- Implement only the behaviour defined in the active specification.

## TypeScript

- Keep strict mode enabled.
- Do not use `any` unless a third-party boundary makes it unavoidable and the reason is documented.
- Use `interface` for object contracts and `type` for unions and aliases.
- Validate unknown input with Zod before using it.
- Prefer clear domain names over generic names such as `data`, `item`, or `handler`.

## Next.js

- Default to Server Components.
- Add `"use client"` only for browser state, hooks, or interactive libraries such as React Flow.
- Keep Route Handlers thin: validate, authorise, call a service, and return a response.
- Do not run long-lived jobs inside Route Handlers.
- Read secrets only on the server.

## Data and Access

- Access PostgreSQL through Prisma.
- Check project access before every project-specific read or mutation.
- Store structured records in PostgreSQL and files in blob storage.
- Use database transactions when one operation must update several related records together.
- Do not log document contents, personal data, credentials, or tokens.

## AI and Trigger.dev

- Define Trigger.dev payload and result schemas with Zod.
- Use stable task IDs and idempotency keys for repeatable operations.
- Store task run IDs and final status in the database.
- Keep prompts in versioned source files or modules, not inline across routes.
- Validate AI output before persistence or canvas updates.

## UI and Styling

- Use shadcn/ui before creating a custom primitive.
- Use the CSS variables and layout rules in `ui-context.md`.
- Keep business logic out of presentational components.
- Provide keyboard labels and accessible names for interactive controls.
- Keep shared state in one hook and pass it down. Where a component inside a layout and a component inside `children` must drive the same state, mount the hook once in the layout component and share it with a small context rather than calling the hook twice.
- Hide an action the current user may not take by not rendering it, rather than by hiding it with CSS, so it stays out of the tab order. This is an affordance only and never replaces the server-side access check.

## File Organisation

- `app/` — routing and page composition.
- `components/ui/` — generated shadcn/ui primitives.
- `components/` — shared application components.
- `features/<feature>/` — feature components, schemas, services, and domain logic.
- `lib/` — shared infrastructure and provider adapters.
- `trigger/` — Trigger.dev tasks.
- `prisma/` — schema and migrations.

Name files after their responsibility, for example `project-access.ts`, `requirement-schema.ts`, or `architecture-canvas.tsx`.

## Verification

Before marking a unit complete:

- Run TypeScript checks.
- Run linting.
- Run relevant tests.
- Run `npm run build`.
- Check the browser console for errors.
- Update `context/progress-tracker.md`.
