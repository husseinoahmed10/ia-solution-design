"use client";

import { X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CollaboratorSummary } from "@/features/collaborators/collaborator-types";

interface CollaboratorListItemProps {
  collaborator: CollaboratorSummary;
  /** Only an owner may remove, so a collaborator's list renders no action. */
  canManage: boolean;
  isRemoving: boolean;
  onRemove: (collaboratorId: string) => void;
}

/**
 * The initial shown while an avatar loads, or when there is no Clerk account for
 * the address. The display name is preferred over the email, so it reads as a
 * person's initial wherever one is known.
 */
function initialOf(collaborator: CollaboratorSummary): string {
  const source = collaborator.displayName ?? collaborator.email;

  return source.trim().charAt(0).toUpperCase();
}

/**
 * One row in the share dialog's collaborator list.
 *
 * Clerk supplies the name and avatar; an address with no Clerk account — an
 * invitee who has not signed up yet — falls back to the email as the row's label,
 * so the row is never blank. The email is always shown somewhere in the row, since
 * it is the identity an invite and a removal act on.
 *
 * The remove button is absent from the DOM for a collaborator rather than
 * disabled, so it cannot be reached by keyboard. That is an affordance only: the
 * route enforces ownership itself.
 */
export function CollaboratorListItem({
  collaborator,
  canManage,
  isRemoving,
  onRemove,
}: CollaboratorListItemProps) {
  const { displayName, email, imageUrl } = collaborator;

  return (
    <li className="flex items-center gap-3 rounded-lg px-1 py-1.5">
      <Avatar size="sm">
        {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
        <AvatarFallback>{initialOf(collaborator)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm">{displayName ?? email}</span>
        {displayName ? (
          <span className="truncate text-xs text-muted-foreground">{email}</span>
        ) : null}
      </div>

      {canManage ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${displayName ?? email}`}
          disabled={isRemoving}
          onClick={() => onRemove(collaborator.id)}
        >
          <X />
        </Button>
      ) : null}
    </li>
  );
}
