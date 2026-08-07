# IA Solution Design

## Overview

IA Solution Design is an AI-assisted web application for Intelligent Automation developers. It turns POD notes, analyst specifications, and operational documents into reviewed requirements, a visual solution design, and a developer-ready build pack for WorkHQ and Blue Prism Design Studio.

## Goals

1. Extract clear, traceable requirements from uploaded project documents.
2. Help a developer design the correct split between WorkHQ, Blue Prism, APIs, data stores, and human tasks.
3. Validate the proposed design against approved SS&C standards and official platform guidance.
4. Generate a build pack detailed enough for a developer to begin implementation.

## Core User Flow

1. The user signs in and creates a project.
2. The user uploads POD notes, analyst specifications, and supporting documents.
3. The application extracts requirements, assumptions, conflicts, and open questions.
4. The user reviews and confirms the requirements.
5. The application proposes a solution architecture on a visual canvas.
6. The user edits and approves the design.
7. The application validates the design against the configured standards.
8. The application generates and stores the developer build pack.
9. The user reviews and downloads the build pack.

## Features

### Project Workspace

- Create, open, search, and archive projects.
- Show project documents, requirements, architecture, findings, and outputs in one workspace.
- Restrict project access to authorised users.

### Source Documents

- Upload PDF, DOCX, XLSX, TXT, and Markdown files.
- Extract content with page, sheet, heading, or section references.
- Keep the original file and its extracted content traceable.

### Requirements Review

- Extract functional requirements, business rules, exceptions, integrations, data needs, security needs, volumes, and human controls.
- Separate confirmed requirements from assumptions, conflicts, questions, rejected items, and out-of-scope items.
- Let the developer amend and approve the requirements before design generation.

### Solution Design Canvas

- Display WorkHQ, Blue Prism, API, database, document-store, external-system, and human components.
- Let the developer add, edit, move, connect, and remove components.
- Link each material component to one or more confirmed requirements.
- Save architecture versions and keep approved versions unchanged.

### AI Design Assistant

- Generate an initial architecture from the approved requirements.
- Explain why each major component is used.
- Apply developer instructions such as replacing RPA with an API or adding human approval.
- Return structured output that is validated before it is saved.

### Standards Validation

- Run code-based checks for rules that can be verified automatically.
- Run bounded AI review for contextual design concerns.
- Show the affected component, rule source, severity, finding, and recommendation.
- Let an authorised reviewer resolve a finding or record an approved exception.

### Developer Build Pack

- Generate the solution overview, requirements traceability, architecture, WorkHQ design, Blue Prism design, integration contracts, exceptions, tests, and build units.
- Export the MVP build pack as Markdown and JSON.

## Scope

### In Scope

- Web application for Intelligent Automation solution design.
- Project and document management.
- Requirements extraction and review.
- Visual architecture design.
- AI-assisted design generation and revision.
- Standards validation.
- Markdown and JSON build-pack generation.

### Out of Scope

- Automatically creating or deploying WorkHQ workflows.
- Automatically creating or deploying Blue Prism processes or objects.
- Production credentials or production-system access.
- Real-time multi-user *canvas editing* in the MVP. A Liveblocks room is created and deleted alongside each project, so the workspace identity and its room stay aligned from the start, but no canvas state is synchronised through it yet.
- Word or PDF export in the MVP.
- A general-purpose architecture tool for technologies outside Intelligent Automation.

## Success Criteria

1. A signed-in user can create and reopen a project.
2. A user can upload a supported document and view its extracted sections.
3. Every extracted requirement retains at least one source reference.
4. A user can review requirements before architecture generation.
5. The application can generate and edit a WorkHQ and Blue Prism architecture.
6. Every material architecture component can be traced to a requirement.
7. Standards findings identify the rule source and affected component.
8. An approved design can be converted into a downloadable Markdown and JSON build pack.
