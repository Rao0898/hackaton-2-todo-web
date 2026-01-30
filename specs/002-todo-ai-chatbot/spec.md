# Feature Specification: Todo AI Chatbot with MCP & Stateless Architecture

**Feature Branch**: `001-todo-ai-chatbot`
**Created**: 2026-01-22
**Status**: Draft
**Input**: User description: "Phase III: Todo AI Chatbot with MCP & Stateless Architecture"

Requirements to include in Spec:

User Interface (Frontend):

Create a Floating Message Icon (bottom-right) that toggles a Sidebar-style Chat Popup.

Integrate OpenAI ChatKit for the conversational interface.

Backend Architecture:

Framework: FastAPI.

AI Logic: OpenAI Agents SDK.

Tools: MCP Server (using Official MCP SDK) to expose task operations.

Stateless Logic & Database:

Use SQLModel with Neon Serverless PostgreSQL.

Persist Conversations and Messages in the DB.

The server must be stateless: Fetch full conversation history from the DB for every request based on conversation_id.

MCP Tools Definitions:

add_task: Title, description, and user_id.

list_tasks: Filter by status (all, pending, completed).

complete_task: Mark by task_id.

delete_task: Remove by task_id.

update_task: Modify title/description.

Agent Persona & Guardrails:

Persona: A friendly productivity assistant like Claude/Gemini.

Languages: Full support for English, Urdu, and Roman Urdu.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core Chat Functionality (Priority: P1)

As a user, I want to click a floating icon and chat in English, Urdu, or Roman Urdu to add and list my tasks.

**Why this priority**: This is the foundational feature that enables users to interact with their tasks through natural language, providing the core value of the AI assistant.

**Independent Test**: User can click the floating chat icon, start a conversation in any of the supported languages, and successfully add or list tasks through the AI assistant.

**Acceptance Scenarios**:

1. **Given** user is on any application page, **When** user clicks the floating chat icon, **Then** a chat window opens on the right side
2. **Given** chat window is open, **When** user types a message in English, Urdu, or Roman Urdu requesting to add a task, **Then** the AI assistant processes the request and adds the task
3. **Given** user has existing tasks, **When** user asks to list tasks in any supported language, **Then** the AI assistant displays the user's tasks

---

### User Story 2 - Task Actions (Priority: P2)

As a user, I want the AI to mark tasks as complete or delete them using natural language commands.

**Why this priority**: This extends the core functionality by allowing users to manage their existing tasks through the AI assistant, completing the basic task management lifecycle.

**Independent Test**: User can successfully mark tasks as complete or delete tasks by issuing natural language commands to the AI assistant.

**Acceptance Scenarios**:

1. **Given** user has existing tasks, **When** user asks the AI to mark a specific task as complete in any supported language, **Then** the AI assistant marks the task as completed
2. **Given** user has existing tasks, **When** user asks the AI to delete a specific task in any supported language, **Then** the AI assistant deletes the task and confirms

---

### User Story 3 - AI Guardrails (Priority: P3)

As a user, if I ask off-topic questions (like 'How to cook biryani?'), the AI should politely bring me back to my tasks.

**Why this priority**: This ensures the AI assistant stays focused on its primary purpose as a productivity tool rather than becoming a general-purpose chatbot.

**Independent Test**: When users ask off-topic questions, the AI assistant recognizes them and redirects the conversation back to task management.

**Acceptance Scenarios**:

1. **Given** user asks an off-topic question like 'How to cook biryani?', **When** the AI receives the request, **Then** it politely redirects back to task management functions
2. **Given** user engages in casual chitchat, **When** user returns to task-related queries, **Then** the AI seamlessly resumes task assistance

---

### Edge Cases

- What happens when the AI service is temporarily unavailable?
- How does the system handle malformed task requests from the AI assistant?
- What occurs when a user tries to access another user's tasks through the AI assistant?
- How does the system handle extremely long conversations that might exceed database limits?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use OpenAI Agents SDK for conversation logic
- **FR-002**: System MUST implement an MCP Server to expose add_task, list_tasks, complete_task, etc.
- **FR-003**: System MUST store all messages and conversations in Neon PostgreSQL using SQLModel
- **FR-004**: UI MUST be a Floating Chat Window on the right side using OpenAI ChatKit
- **FR-005**: System MUST provide a floating message icon at the bottom-right of all application pages that toggles a chat interface
- **FR-006**: System MUST implement a sidebar-style chat popup that appears when the floating icon is clicked
- **FR-007**: System MUST implement stateless architecture by fetching full conversation history from the database for every request based on conversation_id
- **FR-008**: AI assistant MUST support the add_task operation with title, description, and user_id parameters
- **FR-009**: AI assistant MUST support the list_tasks operation with status filtering (all, pending, completed)
- **FR-010**: AI assistant MUST support the complete_task operation by task_id
- **FR-011**: AI assistant MUST support the delete_task operation by task_id
- **FR-012**: AI assistant MUST support the update_task operation to modify title/description
- **FR-013**: AI assistant MUST maintain user isolation by only showing tasks associated with the authenticated user_id
- **FR-014**: AI assistant MUST have a friendly productivity-focused persona similar to Claude/Gemini
- **FR-015**: System MUST support English, Urdu, and Roman Urdu languages with automatic detection
- **FR-016**: AI assistant MUST implement safety guardrails to stay focused on task management and productivity assistance
- **FR-017**: System MUST handle authentication and ensure only authenticated users can access the chatbot functionality

### Key Entities *(include if feature involves data)*

- **Conversation**: Entity with id, user_id, title, and timestamps for tracking chat sessions
- **Message**: Entity with id, conversation_id, role (user/assistant), content, and timestamps for storing individual messages
- **Task**: Represents user tasks managed through the AI assistant, linked to user_id for proper isolation
- **User**: System user with authentication details and association to their conversations and tasks

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access the AI chatbot and initiate conversations within 2 seconds of page load
- **SC-002**: 95% of natural language task management requests are correctly interpreted and executed by the AI assistant
- **SC-003**: Users can successfully perform all core task operations (add, list, complete, delete, update) through the AI assistant
- **SC-004**: AI assistant maintains appropriate context and conversation flow for sessions lasting up to 30 minutes
- **SC-005**: Language detection correctly identifies English, Urdu, and Roman Urdu in 90% of user inputs
- **SC-006**: System maintains user data isolation with 100% accuracy - users never see tasks belonging to other users
- **SC-007**: 90% of users report that the AI assistant improves their task management efficiency

### Constitution Compliance

- **CC-001**: Feature follows Spec-Driven Development methodology with complete spec documentation
- **CC-002**: Implementation respects monorepo structure with clear frontend/backend separation
- **CC-003**: All code generated using AI tools, no manual coding in application directories
- **CC-004**: Backend implements user isolation with user_id filtering for data access
- **CC-005**: Authentication implemented with Better Auth and JWT for security
- **CC-006**: Test-first approach followed with unit, integration, and E2E tests included
- **CC-007**: Database-first design with Neon PostgreSQL and SQLModel ORM utilized
- **CC-008**: Implementation follows stateless architecture principles with proper persistence
- **CC-009**: MCP Server integration follows official SDK guidelines for tool exposure