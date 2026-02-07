# AI Todo Chatbot Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### I. Agentic-First Development
<!-- Example: I. Library-First -->
Strictly no manual code edits. All implementation must follow the Spec → Plan → Task workflow via Claude Code/Agents.
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### II. Containerization (Phase I-II)
<!-- Example: II. CLI Interface -->
Every service must be containerized (optimized via Gordon/Docker AI).
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### III. Kubernetes-Native (Phase IV)
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
All local and cloud deployments must use Helm Charts and be managed via kubectl-ai or kagent.
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### IV. Event-Driven Architecture (Phase V)
<!-- Example: IV. Integration Testing -->
Services must communicate asynchronously via Kafka topics, using Dapr sidecars for abstraction to ensure loose coupling.
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### V. Distributed Runtime Standards
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
State management, secrets, and pub/sub must be handled through Dapr components.
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

### VI. Spec-Driven Development


Follow the strict Spec → Plan → Task workflow for all feature development and system evolution.

## Section 2: Technology Stack
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

### Frontend
- Next.js 16+ with App Router
- TypeScript for type safety
- React for UI components
- OpenAI ChatKit for conversational interface

### Backend
- FastAPI for web framework
- Python 3.13
- OpenAI Agents SDK for AI logic
- MCP Server for tool exposure
- SQLModel for ORM
- Neon Serverless PostgreSQL for database

### Infrastructure & Operations
- Docker for containerization
- Kubernetes for orchestration
- Helm Charts for deployment
- Dapr for distributed systems concerns
- Apache Kafka for event streaming
- Strimzi for Kafka operator
- GitHub Actions for CI/CD

### Cloud & Deployment
- AKS/GKE for cloud Kubernetes
- Dapr sidecars for service mesh capabilities
- PostgreSQL State Store via Dapr
- Kafka Pub/Sub via Dapr
- Secret management via Dapr

[SECTION_2_CONTENT]
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## Section 3: Development Workflow
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

### Feature Development Process
1. Create feature specification in `/specs/[feature-id]-[feature-name]/spec.md`
2. Generate implementation plan with `/sp.plan` command
3. Generate tasks with `/sp.tasks` command
4. Execute implementation with `/sp.implement` command
5. Validate compliance with constitution principles at each phase

### Quality Gates
- All code must be generated via Claude Code agents
- Manual code edits are prohibited
- All features must pass through Spec → Plan → Task workflow
- Containerization required for all services
- Dapr integration for distributed systems concerns
- Event-driven architecture for inter-service communication

[SECTION_3_CONTENT]
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution governs all aspects of the AI Todo Chatbot project and supersedes any conflicting practices or procedures. All development activities must comply with the stated principles and workflows.

### Amendment Process
Any changes to this constitution must be documented with justification, approved by project leadership, and include a migration plan for existing codebase.

### Compliance Verification
All pull requests and reviews must verify compliance with constitution principles. Complexity must be justified against simpler alternatives. Use this constitution as the primary guidance for all development decisions.

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: 1.0.0 | **Ratified**: 2026-02-01 | **Last Amended**: 2026-02-01
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
