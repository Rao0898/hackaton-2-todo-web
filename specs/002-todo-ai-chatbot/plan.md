# Implementation Plan: Todo AI Chatbot with Event-Driven Architecture & Cloud Deployment

**Branch**: `002-todo-ai-chatbot` | **Date**: 2026-02-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-todo-ai-chatbot/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of a Todo AI Chatbot with event-driven architecture using Apache Kafka and Dapr for cloud deployment. The system includes recurring tasks, due dates, search, and filters with notifications delivered via Kafka pub/sub. The application will be deployed to cloud Kubernetes (AKS/GKE) with Dapr sidecar integration for state management, pub/sub messaging, and secret management.

## Technical Context

**Language/Version**: Python 3.13 (backend), TypeScript/JavaScript (frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, MCP Server, OpenAI ChatKit, SQLModel, Neon PostgreSQL, Dapr, Apache Kafka, Strimzi
**Storage**: Neon Serverless PostgreSQL with SQLModel ORM (managed via Dapr State Store)
**Event Streaming**: Apache Kafka (managed via Strimzi operator)
**Service Mesh**: Dapr for pub/sub, state management, and secrets
**Deployment**: Cloud Kubernetes (AKS/GKE) with Helm charts
**CI/CD**: GitHub Actions for automated deployments
**Testing**: pytest for backend, Jest/Vitest for frontend
**Target Platform**: Cloud Kubernetes (AKS/GKE) with Dapr sidecar injection
**Project Type**: Cloud-native microservices with event-driven architecture
**Performance Goals**: <2 seconds initial load, 95% accurate NLP interpretation, <500ms response time
**Constraints**: Event-driven architecture, Dapr integration, cloud-native deployment
**Scale/Scope**: Microservices with distributed event processing, horizontal scalability

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Verification:
- [x] Spec-Driven Development: Confirmed feature has spec in /specs/002-todo-ai-chatbot/spec.md
- [x] Monorepo Structure: Verified project structure follows /frontend and /backend separation
- [x] No Manual Code Policy: Confirmed implementation plan uses AI generation tools only
- [x] Event-Driven Architecture: Verified Kafka pub/sub integration for reminders and recurring tasks
- [x] Dapr Integration: Confirmed pub/sub (Kafka), state store (PostgreSQL), and secrets management
- [x] Cloud-First Approach: Confirmed target environment is cloud Kubernetes (AKS/GKE)
- [x] Advanced Features: Verified recurring tasks, due dates, search, and filters implementation
- [x] Tech Stack Alignment: Confirmed Dapr, Kafka, and cloud Kubernetes deployment

## Project Structure

### Documentation (this feature)

```text
specs/002-todo-ai-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
├── architecture/        # Event-driven and Dapr architecture diagrams
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── conversation.py          # Conversation entity model
│   │   ├── message.py               # Message entity model
│   │   ├── task.py                  # Task entity with recurring/due date fields
│   │   └── user.py                  # User entity model (existing)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_conversation_service.py    # AI conversation handling
│   │   ├── mcp_server_service.py         # MCP server implementation
│   │   ├── task_integration_service.py   # Task operations via MCP
│   │   ├── notification_service.py       # Kafka-based notification service
│   │   ├── recurring_task_service.py     # Kafka-based recurring task service
│   │   └── language_detection_service.py # Multilingual support
│   ├── api/
│   │   ├── __init__.py
│   │   ├── chat.py                     # Chat endpoints
│   │   ├── conversation.py             # Conversation management
│   │   └── tasks.py                    # Task management with filters/search
│   ├── events/
│   │   ├── __init__.py
│   │   ├── publisher.py                # Dapr event publishing
│   │   └── consumer.py                 # Dapr event consuming
│   └── database/
│       ├── __init__.py
│       └── config.py                   # Database configuration via Dapr
├── dapr/
│   ├── components/
│   │   ├── statestore.yaml            # PostgreSQL state store component
│   │   ├── pubsub.yaml                # Kafka pub/sub component
│   │   └── secrets.yaml               # Secrets management component
│   └── config.yaml                    # Dapr configuration
├── kafka/
│   ├── topics/
│   │   ├── reminder-topic.yaml        # Reminder topic definition
│   │   └── recurring-task-topic.yaml  # Recurring task topic definition
│   └── consumers/
│       ├── reminder-consumer.py       # Reminder consumer service
│       └── recurring-task-consumer.py # Recurring task consumer service
├── helm/
│   ├── todo-app/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── ingress.yaml
│   │       ├── _helpers.tpl
│   │       └── dapr-sidecar-injection.yaml
│   └── kafka/
│       └── strimzi-kafka/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
└── requirements.txt

frontend/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── FloatingChatButton.tsx     # Floating chat icon
│   │   │   ├── ChatWindow.tsx             # Main chat interface
│   │   │   ├── MessageBubble.tsx          # Individual message display
│   │   │   └── ChatInput.tsx              # Input field with send button
│   │   ├── task/
│   │   │   ├── TaskList.tsx               # Task list with filters/search
│   │   │   ├── TaskFilter.tsx             # Task filtering component
│   │   │   ├── TaskSearch.tsx             # Task search component
│   │   │   └── RecurringTaskConfig.tsx    # Recurring task configuration
│   │   ├── ui/                           # Shared UI components
│   │   └── layout/                       # Layout components
│   ├── services/
│   │   ├── api/
│   │   │   ├── chatService.ts            # Chat API functions
│   │   │   ├── conversationService.ts    # Conversation API functions
│   │   │   └── taskService.ts            # Task API functions with filters/search
│   │   └── ai/
│   │       └── chatClient.ts             # OpenAI ChatKit integration
│   ├── context/
│   │   └── chat-context.tsx              # Chat state management
│   ├── hooks/
│   │   └── useChat.ts                    # Chat-related hooks
│   └── types/
│       └── chat.ts                       # Chat-related TypeScript types
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── package.json

.infrastructure/
├── github-actions/
│   ├── ci.yml                           # Continuous integration workflow
│   ├── cd-dev.yml                       # Development deployment
│   └── cd-prod.yml                      # Production deployment
└── k8s-manifests/                       # Kubernetes manifests
    ├── namespace.yaml
    ├── dapr-config.yaml
    └── kafka-operator.yaml
```

**Structure Decision**: Cloud-native microservices structure with Dapr for distributed systems concerns, Apache Kafka for event streaming, and Kubernetes for orchestration. Backend handles AI logic, MCP server, event processing, and distributed state management. Frontend manages UI/UX with enhanced task features including search, filters, and recurring task configuration.

## Implementation Phases

### Phase 0: Research & Setup
1. Research Dapr integration patterns with FastAPI applications
2. Investigate Apache Kafka and Strimzi operator setup on Kubernetes
3. Plan event-driven architecture for reminders and recurring tasks
4. Examine cloud Kubernetes deployment strategies (AKS/GKE)

### Phase 1: Infrastructure & Event Architecture
1. Install Dapr on Kubernetes cluster
2. Deploy Strimzi Kafka operator to the cluster
3. Create Kafka topics for reminders and recurring tasks
4. Configure Dapr components for pub/sub, state store, and secrets

### Phase 2: Backend Enhancement
1. Refactor existing services to use Dapr sidecars for state management
2. Implement event publishers to send reminder and recurring task events via Dapr HTTP API
3. Create Kafka consumers for notification and recurring task services
4. Update Task model to include due dates, recurring schedules, and filters
5. Implement search and filtering capabilities for tasks

### Phase 3: Frontend Enhancement
1. Add task search functionality to UI
2. Implement task filtering controls
3. Create recurring task configuration interface
4. Add due date selection and display
5. Update UI to reflect new advanced features

### Phase 4: Cloud Deployment
1. Create Helm charts for cloud deployment
2. Set up GitHub Actions for CI/CD pipeline
3. Configure cloud-specific Kubernetes manifests
4. Deploy to cloud Kubernetes environment (AKS/GKE)

### Phase 5: Integration & Testing
1. Test event-driven architecture with Kafka pub/sub
2. Verify Dapr integration for state management and secrets
3. Validate cloud deployment and scalability
4. Conduct end-to-end testing of all enhanced functionalities
5. Performance testing for distributed event processing

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Event-Driven Architecture | Required for scalable reminders and recurring tasks | Polling approach would be inefficient and resource-intensive |
| Dapr Integration | Required for simplified distributed systems concerns | Managing distributed state, pub/sub, and secrets without Dapr would be complex |
| Cloud-Native Deployment | Required for production scalability and reliability | Minikube deployment is only suitable for local development |
| Microservices Architecture | Required for independent scaling of components | Monolithic architecture wouldn't scale effectively for event processing |
