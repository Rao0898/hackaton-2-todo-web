# Tasks: Todo AI Chatbot with MCP & Stateless Architecture

**Feature**: Todo AI Chatbot with MCP & Stateless Architecture
**Feature Branch**: `001-todo-ai-chatbot`
**Generated**: 2026-01-22
**Input**: spec.md, plan.md

## Dependencies

**User Story Order**:
1. US1 - Core Chat Functionality (P1 - Highest priority)
2. US2 - Task Actions (P2 - Medium priority)
3. US3 - AI Guardrails (P3 - Lower priority)

**Parallel Execution Opportunities**:
- T003-T006 [P]: Database models can be developed in parallel
- T007-T010 [P]: API endpoints can be developed in parallel after models
- T011-T013 [P]: Frontend components can be developed in parallel

## Implementation Strategy

**MVP Scope**: Complete US1 (Core Chat Functionality) with minimal viable features:
- Conversation and Message models
- Basic chat API endpoints
- Floating chat UI component
- Simple AI integration for add/list tasks

**Incremental Delivery**:
- MVP: US1 (Core functionality)
- Release 2: US2 (Task actions)
- Release 3: US3 (Guardrails and advanced features)

---

## Phase 1: Setup & Environment

- [ ] T001 Create backend project structure in `/backend/src/` with proper package init files
- [ ] T002 Install required dependencies: FastAPI, SQLModel, Neon PostgreSQL drivers, OpenAI SDK, MCP SDK
- [ ] T003 Configure database connection using existing Neon PostgreSQL configuration
- [ ] T004 Set up frontend project structure in `/frontend/src/` for chat components

---

## Phase 2: Foundational Components

- [ ] T005 Implement database configuration in `/backend/src/database/config.py` with Neon PostgreSQL settings
- [ ] T006 Create database session management in `/backend/src/database/database.py`
- [ ] T007 Set up authentication middleware to ensure user isolation for chat functionality
- [ ] T008 Create base API router structure in `/backend/src/api/__init__.py`

---

## Phase 3: [US1] Core Chat Functionality

**Goal**: Enable users to click a floating icon and chat in English, Urdu, or Roman Urdu to add and list their tasks.

**Independent Test Criteria**: User can click the floating chat icon, start a conversation in any of the supported languages, and successfully add or list tasks through the AI assistant.

### 3.1 Database Models

- [ ] T009 [P] [US1] Create Conversation model in `/backend/src/models/conversation.py` with id, user_id, title, timestamps
- [ ] T010 [P] [US1] Create Message model in `/backend/src/models/message.py` with id, conversation_id, role, content, timestamps
- [ ] T011 [US1] Update User model in `/backend/src/models/user.py` to establish relationship with conversations
- [ ] T012 [US1] Create database migration scripts for Conversation and Message tables

### 3.2 Backend Services

- [ ] T013 [P] [US1] Implement ConversationService in `/backend/src/services/conversation_service.py` for CRUD operations
- [ ] T014 [P] [US1] Implement MessageService in `/backend/src/services/message_service.py` for message handling
- [ ] T015 [US1] Create LanguageDetectionService in `/backend/src/services/language_detection_service.py` for multilingual support
- [ ] T016 [US1] Implement AIConversationService in `/backend/src/services/ai_conversation_service.py` with OpenAI integration

### 3.3 API Endpoints

- [ ] T017 [P] [US1] Create conversation management endpoints in `/backend/src/api/conversation.py`
- [ ] T018 [P] [US1] Create chat endpoints in `/backend/src/api/chat.py` for message exchange
- [ ] T019 [US1] Implement stateless chat logic that fetches full conversation history from DB for each request
- [ ] T020 [US1] Add authentication and user isolation to chat endpoints to ensure users can't access others' conversations

### 3.4 Frontend Components

- [ ] T021 [P] [US1] Create FloatingChatButton component in `/frontend/src/components/chat/FloatingChatButton.tsx`
- [ ] T022 [P] [US1] Create ChatWindow component in `/frontend/src/components/chat/ChatWindow.tsx` with sidebar layout
- [ ] T023 [P] [US1] Create MessageBubble component in `/frontend/src/components/chat/MessageBubble.tsx` for displaying messages
- [ ] T024 [US1] Create ChatInput component in `/frontend/src/components/chat/ChatInput.tsx` with send functionality
- [ ] T025 [US1] Implement chat API service functions in `/frontend/src/services/api/chatService.ts`

### 3.5 Integration & Testing

- [ ] T026 [US1] Connect frontend chat components to backend API endpoints
- [ ] T027 [US1] Test basic conversation flow: create conversation, send messages, receive AI responses
- [ ] T028 [US1] Verify multilingual support works for English, Urdu, and Roman Urdu
- [ ] T029 [US1] Test user isolation to ensure one user cannot see another's conversations

---

## Phase 4: [US2] Task Actions

**Goal**: Enable users to have the AI mark tasks as complete or delete them using natural language commands.

**Independent Test Criteria**: User can successfully mark tasks as complete or delete tasks by issuing natural language commands to the AI assistant.

### 4.1 MCP Server Implementation

- [ ] T030 [P] [US2] Create MCP Server service in `/backend/src/services/mcp_server_service.py` with tool definitions
- [ ] T031 [P] [US2] Implement add_task tool in MCP server with title, description, user_id parameters
- [ ] T032 [P] [US2] Implement list_tasks tool in MCP server with status filtering (all, pending, completed)
- [ ] T033 [US2] Implement complete_task tool in MCP server with task_id parameter
- [ ] T034 [US2] Implement delete_task tool in MCP server with task_id parameter
- [ ] T035 [US2] Implement update_task tool in MCP server for modifying title/description

### 4.2 Task Integration Service

- [ ] T036 [US2] Create TaskIntegrationService in `/backend/src/services/task_integration_service.py` to connect AI to task operations
- [ ] T037 [US2] Update AIConversationService to use MCP tools for task operations
- [ ] T038 [US2] Test natural language processing for task commands (complete, delete, update)

### 4.3 API & Frontend Updates

- [ ] T039 [US2] Update chat endpoints to support task operation callbacks
- [ ] T040 [US2] Enhance chat UI to display task operation confirmations and results

---

## Phase 5: [US3] AI Guardrails

**Goal**: Ensure the AI politely redirects off-topic questions back to task management functions.

**Independent Test Criteria**: When users ask off-topic questions, the AI assistant recognizes them and redirects the conversation back to task management.

### 5.1 AI Safety Implementation

- [ ] T041 [US3] Enhance AIConversationService with guardrail logic to detect off-topic queries
- [ ] T042 [US3] Implement persona management to maintain productivity-focused assistant behavior
- [ ] T043 [US3] Add polite redirection responses for off-topic questions like 'How to cook biryani?'

### 5.2 Testing & Refinement

- [ ] T044 [US3] Test guardrail effectiveness with various off-topic queries
- [ ] T045 [US3] Refine AI responses to maintain helpful, professional tone while redirecting to tasks
- [ ] T046 [US3] Verify AI maintains context when returning to task-related queries

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T047 Implement conversation history cleanup for extremely long conversations to prevent database limits
- [ ] T048 Add error handling for when AI service is temporarily unavailable
- [ ] T049 Optimize response times for chat functionality to meet <500ms requirement
- [ ] T050 Conduct end-to-end testing of all chatbot functionalities
- [ ] T051 Update documentation for chatbot features and API endpoints
- [ ] T052 Performance testing to ensure system meets measurable outcomes (95% NLP accuracy, 2s load time, etc.)