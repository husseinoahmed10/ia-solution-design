<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Application Building Context

Read the following files in order before implementing or making an architectural decision:

1. `context/project-overview.md` — product definition, user flow, features, and scope
2. `context/architecture.md` — technology stack, system boundaries, storage, and invariants
3. `context/ui-context.md` — visual language and layout conventions
4. `context/code-standards.md` — implementation rules and file organisation
5. `context/ai-workflow-rules.md` — development workflow and scoping rules
6. `context/progress-tracker.md` — current state, decisions, and next step

Also read the active feature specification in `context/specs/` before writing code.

Implement one feature unit at a time. Do not invent missing behaviour. Update `context/progress-tracker.md` after each meaningful implementation change.

If implementation changes the product scope, architecture, UI conventions, or code rules, update the relevant context file before continuing.
