import {
  FileSearch,
  Network,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Left panel of the auth pages: the wordmark at the top, a headline and
 * supporting line, the three things the product does, and the copyright pinned
 * to the bottom. It sits on --brand-panel so this half reads as a tinted
 * surface against the near-black --background the form sits on.
 */
interface BrandFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: BrandFeature[] = [
  {
    icon: FileSearch,
    title: "Traceable requirements",
    description:
      "Extract requirements from POD notes and analyst specifications, each one kept linked to its source.",
  },
  {
    icon: Network,
    title: "Designed component split",
    description:
      "Work out what belongs in WorkHQ, Blue Prism, APIs, and human tasks on a visual canvas.",
  },
  {
    icon: ShieldCheck,
    title: "Validated build pack",
    description:
      "Check the design against approved SS&C standards, then generate a developer-ready build pack.",
  },
];

interface AuthBrandPanelProps {
  className?: string;
}

export function AuthBrandPanel({ className }: AuthBrandPanelProps) {
  return (
    <aside
      className={cn(
        "flex-col justify-between gap-12 border-r border-brand-panel-border bg-brand-panel px-14 py-12",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <Workflow className="size-4" />
        </span>
        <span className="text-base font-semibold tracking-tight">
          IA Solution Design
        </span>
      </div>

      <div className="flex max-w-lg flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-4xl font-semibold leading-[1.15] tracking-tight text-balance">
            From project documents to a developer-ready design.
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground text-pretty">
            One place to review what the automation has to do, design how it is
            built, and hand it over with the detail a developer needs.
          </p>
        </div>

        <ul className="flex flex-col gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-4">
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-surface text-primary"
              >
                <Icon className="size-4" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold tracking-tight">{title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        SS&amp;C Intelligent Automation
      </p>
    </aside>
  );
}
