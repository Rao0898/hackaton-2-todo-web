---
id: 2
title: Create Advanced Todo App Spec
stage: spec
date: 2026-01-15
surface: agent
model: claude-sonnet-4-5-20250929
feature: advanced-todo-app
branch: 1-advanced-todo-app
user: user
command: sp.specify
labels: [specification, todo-app, full-stack]
links:
  spec: specs/1-advanced-todo-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/1-advanced-todo-app/spec.md
  - specs/1-advanced-todo-app/checklists/requirements.md
  - CLAUDE.md
  - frontend/CLAUDE.md
  - backend/CLAUDE.md
  - .spec-kit/config.yaml
  - specs/features/
  - specs/api/
  - specs/database/
  - specs/ui/
tests:
  - none
---

## Prompt

Execute /sp.specify to create the full technical documentation for Phase II: Full-Stack Advanced Todo App. You must strictly follow the monorepo folder structure mentioned in the documentation.

1. Monorepo Folder Structure Requirements:

specs/: Organized into features/, api/, database/, and ui/.

.spec-kit/config.yaml: Define project version, paths, and phases.

frontend/: Next.js 16+ App Router project with its own CLAUDE.md.

backend/: FastAPI project with its own CLAUDE.md.

Root CLAUDE.md: For project overview and cross-cutting commands.

2. Technical Specifications:

Database: Define SQLModel schema for Neon PostgreSQL. Must include tables for Users and Tasks. Tasks table must support: priority (Enum), tags (JSON/Array), due_date, and recurrence_pattern.

Auth (Better Auth + JWT): Specify the shared secret logic for backend verification and user isolation.

Features: Fully specify Task CRUD, Search, Keyword Filtering, and Recurring Task auto-rescheduling.

UI/UX: Dark-theme, Framer Motion animations (

## Response snapshot

Successfully created the full technical documentation for Phase II: Full-Stack Advanced Todo App with the following deliverables:

1. Created the feature specification at specs/1-advanced-todo-app/spec.md with:
   - User stories covering basic task management, task organization, search/filtering, and recurring tasks
   - Functional requirements including CRUD operations, priorities, tags, search, recurring tasks
   - Success criteria with measurable outcomes
   - Key entities (User, Task, Tag)

2. Created directory structure:
   - specs/features/, specs/api/, specs/database/, specs/ui/
   - frontend/ and backend/ directories

3. Created documentation files:
   - Root CLAUDE.md with project overview
   - frontend/CLAUDE.md with frontend specifics
   - backend/CLAUDE.md with backend specifics

4. Created configuration:
   - .spec-kit/config.yaml with project settings

5. Created validation checklist at specs/1-advanced-todo-app/checklists/requirements.md

The specification follows the constitution requirements and is ready for the planning phase.

## Outcome

- ✅ Impact: Complete spec for advanced todo app with all user stories and requirements
- 🧪 Tests: none
- 📁 Files: spec.md, CLAUDE.md files, config.yaml, checklists, directories created
- 🔁 Next prompts: Ready for /sp.plan to generate implementation plan
- 🧠 Reflection: Specification covers all required features and follows monorepo structure

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Proceed with planning phase