# Phase II: Full-Stack Advanced Todo App - Backend Documentation

This directory contains the FastAPI backend application.

## Features

- User authentication and authorization with Better Auth
- Task CRUD operations with user isolation
- Priority management (High/Medium/Low)
- Tag assignment and filtering
- Search functionality
- Recurring task management with auto-rescheduling
- Due date handling
- Recurrence pattern support

## Tech Stack

- FastAPI
- Python 3.13+
- SQLModel ORM
- Neon PostgreSQL
- Better Auth with JWT
- PyJWT for token verification

## Structure

- `src/` - Main application code
- `models/` - SQLModel database models
- `schemas/` - API request/response schemas
- `api/` - API route handlers
- `services/` - Business logic implementations
- `database/` - Database connection and session management