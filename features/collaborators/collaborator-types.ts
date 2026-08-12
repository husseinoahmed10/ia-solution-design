/**
 * One collaborator on a project, as the share dialog renders them.
 *
 * `email` is the identity: it is what the database stores and what an invite and
 * a removal address. `displayName` and `imageUrl` are enrichment from Clerk and
 * are both `null` for an address with no Clerk account, in which case the row
 * shows the email alone.
 */
export interface CollaboratorSummary {
  id: string;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
}

/**
 * What the share dialog is allowed to do, decided by the server.
 *
 * Only an owner may invite or remove, so a collaborator receives `false` and the
 * dialog renders the list alone. This is an affordance: the invite and remove
 * routes enforce ownership themselves.
 */
export interface CollaboratorListResponse {
  collaborators: CollaboratorSummary[];
  canManage: boolean;
}
