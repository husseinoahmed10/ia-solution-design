import {
  AppWindow,
  Bot,
  Cpu,
  Database,
  ListOrdered,
  Package,
  Play,
  Plug,
  User,
  UserCheck,
  Webhook,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import type { CanvasComponentType, CanvasNodeShape } from "@/types/canvas";

/**
 * The catalogue of IA components a solution design is drawn from.
 *
 * This is the only place a component's display name, icon, and shape are decided.
 * The toolbar renders it and the drop handler reads it, so a component added here
 * appears on the canvas with no other change.
 *
 * The shapes are this application's visual conventions for a high-level
 * architecture. They deliberately do not reproduce the WorkHQ or Design Studio
 * interface, and nothing here describes what those products can do (invariant 7):
 * a catalogue entry is a name, a picture, and an outline.
 */

/** One entry in the toolbar. */
export interface CanvasComponentDefinition {
  type: CanvasComponentType;
  /** The display name, and the label a dropped node starts with. */
  label: string;
  shape: CanvasNodeShape;
  icon: LucideIcon;
  /**
   * What the component stands for, used as the drag button's `title` and its
   * accessible description. `ui-context.md` asks for a tooltip on unfamiliar
   * WorkHQ and Design Studio icons; no `Tooltip` primitive is installed, so the
   * native one carries it for now.
   */
  description: string;
}

/** A toolbar section: a heading and the components under it. */
export interface CanvasComponentGroup {
  id: "workhq" | "design-studio" | "shared";
  label: string;
  components: CanvasComponentDefinition[];
}

/**
 * The three groups, in the order they appear in the toolbar.
 *
 * `Process` and `Business Object` are one component each here. Each represents a
 * high-level piece of the architecture and will later open its own detailed design
 * canvas, so their internal stages and actions are deliberately absent.
 */
export const canvasComponentGroups: CanvasComponentGroup[] = [
  {
    id: "workhq",
    label: "WorkHQ",
    components: [
      {
        type: "workhq-trigger",
        label: "Trigger",
        shape: "circle",
        icon: Play,
        description: "What starts the work",
      },
      {
        type: "workhq-action",
        label: "Action",
        shape: "rectangle",
        icon: Workflow,
        description: "A step the solution performs",
      },
      {
        type: "workhq-agent",
        label: "Agent",
        shape: "hexagon",
        icon: Bot,
        description: "An agent that carries out work",
      },
      {
        type: "workhq-human-task",
        label: "Human Task",
        shape: "pill",
        icon: UserCheck,
        description: "Work handed to a person",
      },
      {
        type: "workhq-connector",
        label: "Connector",
        shape: "hexagon",
        icon: Plug,
        description: "A connection to another system",
      },
      {
        type: "digital-worker",
        label: "Digital Worker",
        shape: "pill",
        icon: Cpu,
        description: "A digital worker in the solution",
      },
    ],
  },
  {
    id: "design-studio",
    label: "Design Studio",
    components: [
      {
        type: "design-studio-process",
        label: "Process",
        shape: "pill",
        icon: Workflow,
        description: "A process, designed on its own canvas later",
      },
      {
        type: "business-object",
        label: "Business Object",
        shape: "rectangle",
        icon: Package,
        description: "A business object, designed on its own canvas later",
      },
      {
        type: "work-queue",
        label: "Work Queue",
        shape: "cylinder",
        icon: ListOrdered,
        description: "A queue of items waiting to be worked",
      },
    ],
  },
  {
    id: "shared",
    label: "Shared",
    components: [
      {
        type: "api",
        label: "API",
        shape: "hexagon",
        icon: Webhook,
        description: "An interface the solution calls",
      },
      {
        type: "database",
        label: "Database",
        shape: "cylinder",
        icon: Database,
        description: "A data store the solution reads or writes",
      },
      {
        type: "external-application",
        label: "External Application",
        shape: "rectangle",
        icon: AppWindow,
        description: "An application outside the solution",
      },
      {
        type: "human-actor",
        label: "Human Actor",
        shape: "circle",
        icon: User,
        description: "A person who takes part in the process",
      },
    ],
  },
];

/**
 * Every component, flattened, keyed by its stored type. The drop handler needs a
 * lookup rather than the grouping, and a stored type that no longer exists in the
 * catalogue must be answerable — hence a map rather than a search.
 */
export const canvasComponentsByType: Map<
  CanvasComponentType,
  CanvasComponentDefinition
> = new Map(
  canvasComponentGroups.flatMap((group) =>
    group.components.map((component) => [component.type, component])
  )
);

/**
 * The component types as a runtime list, derived from the catalogue so it cannot
 * fall behind it. The drag payload schema validates against this.
 */
export const canvasComponentTypes = Array.from(canvasComponentsByType.keys());
