# AI Workflow Rules

## Approach

Build IA Solution Design incrementally using the context files and one feature specification at a time. Do not infer the full implementation from the product description alone.

## Scoping Rules

- Work on one build-plan unit at a time.
- Prefer a small end-to-end result over a large partial implementation.
- Do not add future features because they appear convenient.
- Do not refactor unrelated code while implementing a unit.
- Install only the dependencies required by the active unit.

## When to Split Work

Split a unit when it combines several independent concerns, such as:

- authentication and document extraction;
- manual canvas editing and AI generation;
- standards storage and standards validation;
- build-pack content generation and additional export formats.

If the change cannot be explained and verified clearly, it is too broad.

## Missing or Ambiguous Requirements

- Do not invent product behaviour.
- Check the six context files and active specification first.
- Add unresolved decisions to `progress-tracker.md` under Open Questions.
- Ask for a decision before making a change that is difficult to reverse.

## Protected Files

Do not modify these without a specific reason in the active specification:

- generated files in `components/ui/`;
- generated Prisma client files;
- third-party library code;
- environment files containing secrets.

## Documentation

- Update the relevant context file when a product, architecture, UI, or coding rule changes.
- Update `progress-tracker.md` after every meaningful implementation change.
- Record what is actually complete, not what is planned.

## Before Moving to the Next Unit

1. The unit works end to end within its stated scope.
2. The verification checklist in the active specification passes.
3. No invariant in `architecture.md` is violated.
4. There are no unexplained TypeScript, lint, build, test, or console errors.
5. The progress tracker is current.
