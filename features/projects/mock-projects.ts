import type { ProjectSummary } from "@/features/projects/project-types";

/**
 * Stand-in project list for the editor chrome. It exists so the sidebar and the
 * dialogs can be built and checked before persistence lands, and it is the only
 * place this placeholder data appears — a later unit replaces this module with
 * real reads and deletes it.
 */
export const mockProjects: ProjectSummary[] = [
  {
    id: "prj_invoice_intake",
    name: "Invoice Intake Automation",
    slug: "invoice-intake-automation",
    access: "owner",
  },
  {
    id: "prj_claims_triage",
    name: "Claims Triage Redesign",
    slug: "claims-triage-redesign",
    access: "owner",
  },
  {
    id: "prj_onboarding_pack",
    name: "Client Onboarding Pack",
    slug: "client-onboarding-pack",
    access: "collaborator",
  },
];
