# Data Model: Phase II: Full-Stack Advanced Todo App

## Entity: User
**Description**: Represents the application user with authentication details and preferences

**Fields**:
- id: UUID (primary key, auto-generated)
- email: String (unique, indexed, required, validated as email)
- password_hash: String (hashed, required)
- name: String (optional)
- created_at: DateTime (auto-generated)
- updated_at: DateTime (auto-generated)
- is_active: Boolean (default: true)

**Relationships**:
- One-to-Many: User -> Tasks (user.tasks)

## Entity: Task
**Description**: Represents individual tasks with title, description, priority, tags, due_date, recurrence_pattern, and completion status

**Fields**:
- id: UUID (primary key, auto-generated)
- title: String (required, max_length: 255)
- description: Text (optional)
- priority: Enum (values: 'high', 'medium', 'low', default: 'medium')
- tags: JSON (array of strings, optional, indexed for search)
- due_date: DateTime (optional)
- recurrence_pattern: JSON (optional, structure: {'type': 'daily|weekly|monthly|yearly', 'interval': integer, 'end_date': datetime})
- completed: Boolean (default: false)
- completed_at: DateTime (optional)
- user_id: UUID (foreign key to User.id, required, indexed)
- created_at: DateTime (auto-generated)
- updated_at: DateTime (auto-generated)
- next_occurrence: DateTime (for recurring tasks, optional)

**Relationships**:
- Many-to-One: Task -> User (task.user)
- Self-Reference: Task -> Task (for recurring tasks - parent/child relationship)

**Validation Rules**:
- title is required and must be between 1-255 characters
- due_date must be in the future if provided
- recurrence_pattern must follow the defined structure if provided
- user_id must reference an existing user

**State Transitions**:
- Active (default) -> Completed (when marked complete)
- Completed -> Active (when unmarked)
- For recurring tasks: When marked complete, a new instance is created based on recurrence pattern

## Entity: Tag
**Description**: Represents category labels that can be assigned to tasks for organization

**Fields**:
- id: UUID (primary key, auto-generated)
- name: String (required, unique per user, max_length: 50)
- color: String (optional, hex color code)
- user_id: UUID (foreign key to User.id, required, indexed)
- created_at: DateTime (auto-generated)

**Relationships**:
- Many-to-One: Tag -> User (tag.user)
- Many-to-Many: Tag <-> Task (via JSON array in Task.tags field)

**Validation Rules**:
- name is required and must be unique per user
- name must be between 1-50 characters
- color must be a valid hex color code if provided

## Database Indexes
- User.email: Unique index for fast authentication
- Task.user_id: Index for user-specific queries
- Task.priority: Index for priority filtering
- Task.due_date: Index for date-based queries
- Task.completed: Index for completion status filtering
- Task.created_at: Index for chronological ordering
- Task.title, Task.description: Full-text search index
- Tag.user_id: Index for user-specific tag queries

## Constraints
- Foreign key constraints to maintain referential integrity
- Cascade deletion for user deletion (deletes all associated tasks)
- Check constraint on priority field to ensure valid values
- Check constraint on recurrence_pattern structure

## Sample Queries
1. Get all tasks for a user: SELECT * FROM tasks WHERE user_id = $userId
2. Get incomplete tasks with high priority: SELECT * FROM tasks WHERE user_id = $userId AND priority = 'high' AND completed = false
3. Search tasks by keyword: SELECT * FROM tasks WHERE user_id = $userId AND (title ILIKE '%$keyword%' OR description ILIKE '%$keyword%')
4. Get recurring tasks: SELECT * FROM tasks WHERE user_id = $userId AND recurrence_pattern IS NOT NULL AND completed = false