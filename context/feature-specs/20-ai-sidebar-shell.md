# AI Sidebar Shell

Complete the existing AI sidebar placeholder and turn it into a proper floating AI workspace.

The sidebar already exists in the project.

Preserve its current open/close ownership, floating placement, and slide-in behaviour from the right side.

This unit is focused on the sidebar UI only.

## Implementation

1. Separate the AI sidebar into its own component if it is not already isolated.

   - keep open/close state controlled by the existing parent
   - preserve the existing floating placement
   - preserve the existing right-side slide animation
   - preserve the current border, background, radius, and shadow treatment
   - do not change how the existing AI navbar button opens the sidebar

   Use the existing IA Solution Design theme tokens and styles from `globals.css` and `ui-context.md`.

   Reuse existing colour tokens where possible. Only add a new token if the current theme does not support the required UI.

2. Add the sidebar header.

   Include:

   - small bot icon
   - title: `AI Workspace`
   - subtitle: `Design your automation solution`
   - close button aligned to the right

   Use existing foreground and muted text tokens.

3. Add a tabbed layout using the existing shadcn `Tabs`.

   Tabs:

   - `AI Architect`
   - `Specs`

   The active tab should be clearly visible using the existing primary/accent styling.

   Keep inactive tab text muted.

4. Build the `AI Architect` tab.

   Use existing shadcn components where appropriate, including:

   - `Button`
   - `Textarea`
   - `ScrollArea`

   Add a scrollable chat area.

   When there are no messages, show an empty state with:

   - bot icon
   - short description explaining that the AI Architect will help design the IA solution
   - starter prompt chips

   Starter prompts:

   - `Design a WorkHQ workflow`
   - `Design a Design Studio process`
   - `Review this solution architecture`

   Keep the starter prompts as UI suggestions only.

5. Add the chat input area.

   Include:

   - auto-resizing textarea
   - approximately 72px minimum height
   - approximately 160px maximum height
   - send button

   Keyboard behaviour:

   - `Enter` submits the local message
   - `Shift+Enter` inserts a newline

   For this unit, submission must not call an AI service or backend API.

   It is acceptable for the submitted user message to appear locally in the chat area.

   Do not generate an assistant response yet.

   Keep temporary chat and input state local to the sidebar.

6. Add basic message styling.

   User messages should:

   - be right aligned
   - use existing primary/accent surface tokens
   - remain readable against the dark sidebar

   Prepare assistant message styling for later use:

   - left aligned
   - existing card/elevated surface
   - subtle border
   - standard foreground text

   Do not add actual AI-generated responses yet.

7. Build the `Specs` tab.

   Include:

   - `Generate Spec` button
   - one static demo specification card

   Use an IA Solution Design example.

   Example:

   - title: `Solution Architecture Specification`
   - short snippet describing an automation solution design
   - file/spec icon
   - disabled download action

   `Generate Spec` is UI-only in this unit and must not call a backend.

8. Preserve all existing editor behaviour.

   Do not change:

   - project navbar behaviour
   - Templates
   - Share
   - participant presence
   - Clerk `UserButton`
   - Liveblocks room behaviour
   - live cursors
   - canvas nodes or edges
   - canvas controls
   - starter templates

9. Preserve the existing Liveblocks presence model.

   Do not change or use `isThinking` yet.

   AI activity and collaborative thinking state will be wired in a later feature.

## Scope Limits

- don't rebuild the existing sidebar open/close behaviour
- don't add Gemini or another AI provider yet
- don't add AI API routes
- don't add streaming
- don't generate or modify canvas nodes
- don't add Liveblocks AI behaviour
- don't change `isThinking`
- don't generate real specifications
- don't add spec downloads yet
- keep this focused on the AI workspace UI structure

## Check When Done

- existing floating sidebar behaviour is preserved
- sidebar contains `AI Architect` and `Specs` tabs
- AI Architect has empty state, starter prompts, and input UI
- Specs has a Generate Spec button and static demo card
- no AI or backend logic is added
- existing canvas and collaboration behaviour is unchanged
- `npm run build` passes