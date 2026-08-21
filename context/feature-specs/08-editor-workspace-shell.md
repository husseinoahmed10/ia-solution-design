Build the `/editor/[projectId]` workspace shell with server-side access checks. No canvas logic yet.

## Access

`/editor/[projectId]` must be a server component.

Before rendering:

- unauthenticated users redirect to `/sign-in`
- users without project access see `AccessDenied`
- non-existent projects also show `AccessDenied`

Create `components/editor/access-denied.tsx` with:

- centered layout
- lock icon
- short message
- link back to `/editor`

## Access Helpers

Create `lib/project-access.ts` with helpers for:

- getting current Clerk identity: `userId` + primary email
- checking project access by owner or collaborator

Project access is allowed when:

- the current Clerk `userId` matches the project `ownerId`
- or the current user's primary email matches a `ProjectCollaborator`

Keep this access logic outside the page component.

## Layout

Build a full-viewport workspace layout with:

- top navbar showing the project name
- navbar actions: share button and AI sidebar toggle
- existing `ProjectSidebar` on the left
- current project highlighted in the sidebar
- central canvas placeholder with dark background and centered message
- right sidebar placeholder for the future AI design assistant

The canvas area should fill the remaining space.

Use the project ID as the workspace identifier.

The same project ID will later be used as the Liveblocks room ID. Do not create a separate room ID or project slug.

## Project Sidebar

Use the existing project sidebar and existing owned/shared project data pattern.

- show owned projects under `My Projects`
- show collaborator projects under `Shared`
- highlight the current project
- existing project actions should continue to work
- opening the sidebar must continue to overlay the workspace rather than push the canvas

## AI Sidebar

The right sidebar is only a placeholder in this feature.

- it should open and close from the navbar AI sidebar toggle
- it should overlay or occupy the intended right-side workspace area
- show a simple placeholder for the future AI design assistant
- do not add AI functionality yet

## Scope

Do not add:

- real canvas logic
- React Flow
- Liveblocks provider or collaboration state
- AI chat functionality
- sharing behavior
- document upload
- requirements logic

The share button and AI sidebar toggle should be present, but sharing and AI behavior are not implemented yet.

> **Superseded in part by unit 09.** The exclusion of sharing behaviour above
> describes the boundary of *this* unit and was correct when it was written. Unit
> 09 (`09-share-dialog.md`) then implemented the share dialog, so the share
> button is now wired. Do not treat this scope list as a reason to remove or
> disable that flow. Everything else here still stands — in particular React
> Flow, the Liveblocks provider, and AI behaviour remain unimplemented.

## Check When Done

- `/editor/[projectId]` builds successfully
- unauthenticated users redirect to `/sign-in`
- access helper exists outside the page component
- owner access works
- collaborator access works
- `AccessDenied` is used for missing or unauthorized projects
- workspace layout renders with the current project context
- navbar displays the project name
- current project is highlighted in the sidebar
- sidebar continues to show owned and shared projects
- AI sidebar placeholder can be opened and closed
- central canvas placeholder fills the remaining workspace
- no Liveblocks or canvas logic has been added
- no TypeScript errors
- `npm run build` passes
