import type { CanvasComponentType } from "@/types/canvas";

/**
 * Node identifiers for the canvas.
 *
 * A node ID is a key in a Liveblocks `LiveMap` shared by everyone in the room, so
 * two clients must never generate the same one: a collision would not create a
 * second node, it would overwrite the first person's component with the second
 * person's.
 *
 * The ID is built from the component type, a timestamp, and a counter. The type
 * makes a stored document readable; the timestamp separates two drops a second
 * apart; the counter separates two in the same millisecond, which one person
 * dropping quickly can produce and `Date.now()` alone cannot distinguish.
 *
 * The counter is per browser session and is not synchronised, so a random suffix
 * carries the cross-client case: two people dropping the same component in the
 * same millisecond would otherwise agree on every part of the ID.
 *
 * This is not the project identifier rule in `architecture.md` — that says
 * *record* identifiers come from the database. A canvas node is not a database row;
 * it exists only inside the Liveblocks document, which no server writes to.
 */

let dropCounter = 0;

export function createCanvasNodeId(componentType: CanvasComponentType): string {
  dropCounter += 1;

  const uniqueSuffix = Math.random().toString(36).slice(2, 8);

  return `${componentType}-${Date.now()}-${dropCounter}-${uniqueSuffix}`;
}
