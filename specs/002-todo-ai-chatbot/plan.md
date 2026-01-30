# Implementation Plan: Todo AI Chatbot with MCP & Stateless Architecture

**Branch**: `001-todo-ai-chatbot` | **Date**: 2026-01-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-todo-ai-chatbot/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of a Todo AI Chatbot using OpenAI Agents SDK with MCP Server integration. The chatbot provides a floating chat interface using OpenAI ChatKit, enabling users to manage tasks through natural language in English, Urdu, or Roman Urdu. The system uses a stateless architecture with Neon PostgreSQL for persistence, ensuring proper user isolation and conversation history retrieval.

## Technical Context

**Language/Version**: Python 3.13 (backend), TypeScript/JavaScript (frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, MCP Server, OpenAI ChatKit, SQLModel, Neon PostgreSQL
**Storage**: Neon Serverless PostgreSQL with SQLModel ORM
**Testing**: pytest for backend, Jest/Vitest for frontend
**Target Platform**: Web application (Next.js 16+ frontend with FastAPI backend)
**Project Type**: Web application (full-stack)
**Performance Goals**: <2 seconds initial load, 95% accurate NLP interpretation, <500ms response time
**Constraints**: User isolation required, multilingual support (English, Urdu, Roman Urdu), stateless architecture
**Scale/Scope**: Individual user sessions, conversation history persistence, task management operations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Verification:
- [x] Spec-Driven Development: Confirmed feature has spec in /specs/001-todo-ai-chatbot/spec.md
- [x] Monorepo Structure: Verified project structure follows /frontend and /backend separation
- [x] No Manual Code Policy: Confirmed implementation plan uses AI generation tools only
- [x] User Isolation: Verified backend design includes user_id filtering for data access
- [x] Security First: Confirmed authentication with Better Auth and JWT implementation
- [x] Test-First Approach: Confirmed test strategy includes unit, integration, and E2E tests
- [x] Database-First Design: Verified Neon PostgreSQL and SQLModel ORM usage in plan
- [x] Tech Stack Alignment: Confirmed Next.js 16+/TypeScript and FastAPI/Python 3.13+ selection

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-ai-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
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
│   │   └── user.py                  # User entity model (existing)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_conversation_service.py    # AI conversation handling
│   │   ├── mcp_server_service.py         # MCP server implementation
│   │   ├── task_integration_service.py   # Task operations via MCP
│   │   └── language_detection_service.py # Multilingual support
│   ├── api/
│   │   ├── __init__.py
│   │   ├── chat.py                     # Chat endpoints
│   │   └── conversation.py             # Conversation management
│   └── database/
│       ├── __init__.py
│       └── config.py                   # Database configuration
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
│   │   ├── ui/                           # Shared UI components
│   │   └── layout/                       # Layout components
│   ├── services/
│   │   ├── api/
│   │   │   ├── chatService.ts            # Chat API functions
│   │   │   └── conversationService.ts    # Conversation API functions
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
```

**Structure Decision**: Web application structure selected with clear separation between frontend (Next.js) and backend (FastAPI). Backend handles AI logic, MCP server, and database operations. Frontend manages UI/UX with floating chat component using OpenAI ChatKit.

## Implementation Phases

### Phase 0: Research & Setup
1. Research OpenAI Agents SDK integration patterns
2. Investigate MCP Server implementation best practices
3. Examine OpenAI ChatKit for React integration
4. Plan multilingual language detection approaches

### Phase 1: Data Model & Contracts
1. Design Conversation and Message SQLModel entities
2. Define API contracts for chat functionality
3. Create data validation schemas
4. Establish database migration strategy

### Phase 2: Backend Implementation
1. Implement Conversation and Message models with SQLModel
2. Build MCP Server with add_task, list_tasks, complete_task, delete_task, update_task tools
3. Develop AI conversation service with OpenAI Agents SDK
4. Create chat API endpoints with authentication and user isolation
5. Implement language detection service for multilingual support
6. Add guardrails to keep AI focused on task management

### Phase 3: Frontend Implementation
1. Create floating chat button component
2. Build chat window UI with OpenAI ChatKit
3. Implement chat message display and input handling
4. Connect frontend to backend chat APIs
5. Add real-time conversation updates

### Phase 4: Integration & Testing
1. Integrate backend AI services with frontend UI
2. Test user isolation (ensure users can't see others' tasks)
3. Verify multilingual support works correctly
4. Conduct end-to-end testing of all chatbot functionalities
5. Performance testing for response times and conversation persistence

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| MCP Server Integration | Required for exposing task operations to AI agents | Direct API calls would tightly couple AI logic to task management |
| Stateless Architecture | Required for scalable conversation history retrieval | Stateful approach would limit horizontal scaling capabilities |
