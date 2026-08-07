Wire the editor home sidebar and dialogs to the real project API and Liveblocks.

### Data Fetching

The editor home page is a server component.

Fetch owned and shared projects server-side using the existing project data helper and pass both lists to the sidebar.

No client-side fetching for the initial load.

### `useProjectActions`

Create a hook in `hooks/` that manages dialog state and project mutations.

**Create**

- manage create dialog state
- manage project name input
- call `POST /api/projects`
- use the returned project ID as the Liveblocks room ID
- navigate to `/editor/[projectId]`
- refresh on success

Do not generate the room ID from the project name.

The project ID, workspace ID, and Liveblocks room ID should remain aligned.

**Rename**

- store target project ID and current name
- call `PATCH /api/projects/[projectId]`
- refresh on success
- renaming a project must not change its Liveblocks room ID

**Delete**

- store target project
- call `DELETE /api/projects/[projectId]`
- delete the matching Liveblocks room
- redirect to `/editor` if deleting the active workspace
- otherwise refresh

### Wiring

Connect the hook to the sidebar and project dialogs.

- create dialog contains the project name input
- rename dialog pre-fills the current project name
- delete dialog shows the project name
- owned projects show rename and delete actions
- shared projects do not show owner-only actions

Use the project ID directly as the Liveblocks room ID.

Do not add project-name slugs or short unique suffixes.

### Check When Done

- sidebar uses real owned and shared project data
- initial project data is fetched server-side
- create navigates to `/editor/[projectId]`
- the created workspace uses the project ID as its Liveblocks room ID
- rename updates correctly without changing the room ID
- delete removes the project and matching Liveblocks room
- delete refreshes or redirects correctly
- `npm run build` passes