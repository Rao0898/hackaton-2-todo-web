# Task API Contract: Phase II: Full-Stack Advanced Todo App

## Overview
This document defines the API contract for task management operations in the Advanced Todo App. All endpoints require authentication via JWT token in the Authorization header.

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
`http://localhost:8000/api` (development) or `<production-url>/api`

## Task Resource

### Task Object Structure
```json
{
  "id": "uuid-string",
  "title": "string (required, max 255 chars)",
  "description": "string (optional)",
  "priority": "enum: 'high' | 'medium' | 'low'",
  "tags": ["string"],
  "due_date": "ISO 8601 datetime string (optional)",
  "recurrence_pattern": {
    "type": "enum: 'daily' | 'weekly' | 'monthly' | 'yearly'",
    "interval": "integer",
    "end_date": "ISO 8601 datetime string (optional)"
  } | null,
  "completed": "boolean (default: false)",
  "completed_at": "ISO 8601 datetime string (optional)",
  "user_id": "uuid-string",
  "created_at": "ISO 8601 datetime string",
  "updated_at": "ISO 8601 datetime string",
  "next_occurrence": "ISO 8601 datetime string (for recurring tasks)"
}
```

## Endpoints

### Create Task
- **Endpoint**: `POST /tasks`
- **Authentication**: Required
- **Request Body**:
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "priority": "enum: 'high' | 'medium' | 'low' (optional, default: 'medium')",
  "tags": ["string"] (optional)",
  "due_date": "ISO 8601 datetime string (optional)",
  "recurrence_pattern": {
    "type": "enum: 'daily' | 'weekly' | 'monthly' | 'yearly'",
    "interval": "integer",
    "end_date": "ISO 8601 datetime string (optional)"
  } | null
}
```
- **Response**: 201 Created
```json
{
  "success": true,
  "data": {
    // Task object as defined above
  }
}
```
- **Errors**: 400 Bad Request, 401 Unauthorized, 422 Validation Error

### Get All Tasks
- **Endpoint**: `GET /tasks`
- **Authentication**: Required
- **Query Parameters**:
  - `priority`: Filter by priority ('high', 'medium', 'low')
  - `completed`: Filter by completion status (true, false)
  - `due_after`: Filter tasks with due date after this date
  - `due_before`: Filter tasks with due date before this date
  - `search`: Search term for title/description/tags
  - `limit`: Number of results to return (default: 50)
  - `offset`: Number of results to skip (default: 0)
- **Response**: 200 OK
```json
{
  "success": true,
  "data": [
    // Array of Task objects
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```
- **Errors**: 401 Unauthorized

### Get Task by ID
- **Endpoint**: `GET /tasks/{task_id}`
- **Authentication**: Required
- **Response**: 200 OK
```json
{
  "success": true,
  "data": {
    // Task object as defined above
  }
}
```
- **Errors**: 401 Unauthorized, 404 Not Found

### Update Task
- **Endpoint**: `PUT /tasks/{task_id}`
- **Authentication**: Required
- **Request Body**: Same as Create Task (all fields optional for updates)
- **Response**: 200 OK
```json
{
  "success": true,
  "data": {
    // Updated Task object
  }
}
```
- **Errors**: 400 Bad Request, 401 Unauthorized, 404 Not Found, 422 Validation Error

### Delete Task
- **Endpoint**: `DELETE /tasks/{task_id}`
- **Authentication**: Required
- **Response**: 200 OK
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```
- **Errors**: 401 Unauthorized, 404 Not Found

### Toggle Task Completion
- **Endpoint**: `PATCH /tasks/{task_id}/toggle-complete`
- **Authentication**: Required
- **Response**: 200 OK
```json
{
  "success": true,
  "data": {
    // Updated Task object with toggled completion status
  }
}
```
- **Errors**: 401 Unauthorized, 404 Not Found

### Search Tasks
- **Endpoint**: `GET /tasks/search`
- **Authentication**: Required
- **Query Parameters**:
  - `q`: Search query string (searches title, description, and tags)
  - `priority`: Filter by priority ('high', 'medium', 'low')
  - `completed`: Filter by completion status (true, false)
  - `tags`: Comma-separated list of tags to filter by
- **Response**: 200 OK
```json
{
  "success": true,
  "data": [
    // Array of Task objects matching search criteria
  ],
  "query": "string (the search query)",
  "total_results": "number"
}
```
- **Errors**: 401 Unauthorized

## Error Response Format
All error responses follow this structure:
```json
{
  "success": false,
  "error": {
    "code": "string (error code)",
    "message": "string (human-readable error message)",
    "details": "object (optional, additional error details)"
  }
}
```

## Rate Limiting
- API requests are limited to 1000 requests per hour per user
- Exceeding the limit returns a 429 Too Many Requests response

## Validation Rules
- Title: Required, 1-255 characters
- Description: Optional, max 10000 characters
- Priority: Must be one of 'high', 'medium', 'low'
- Tags: Array of strings, max 10 tags per task, max 50 chars per tag
- Due date: Must be a valid ISO 8601 datetime string
- Recurrence pattern: Must follow the defined structure if provided