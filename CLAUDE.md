# Phase II: Full-Stack Advanced Todo App - Root Documentation

This repository contains a full-stack advanced todo application built as a monorepo.

## Structure

- `frontend/` - Next.js 16+ application with App Router
- `backend/` - FastAPI application
- `specs/` - Feature specifications, API definitions, database schemas, and UI designs
- `.spec-kit/` - Configuration for the Spec-Driven Development workflow

## Cross-Cutting Commands

This project follows the Spec-Driven Development methodology. Key commands:

- `/sp.specify` - Create feature specifications
- `/sp.plan` - Generate implementation plans
- `/sp.tasks` - Generate development tasks
- `/sp.implement` - Execute implementation tasks

## Development Workflow

1. Create specifications in `specs/features/`
2. Generate implementation plan with `/sp.plan`
3. Generate tasks with `/sp.tasks`
4. Implement with `/sp.implement`