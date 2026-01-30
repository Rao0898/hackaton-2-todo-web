# Phase II: Full-Stack Advanced Todo App - Backend

This directory contains the FastAPI backend application for the Advanced Todo App.

## Features

- User authentication and authorization with JWT
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
- JWT for authentication

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the application:
```bash
uvicorn src.main:app --reload
```

## API Documentation

Once the application is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Project Structure

```
backend/
├── src/
│   ├── models/      # SQLModel database models
│   ├── schemas/     # API request/response schemas
│   ├── api/         # API route handlers
│   ├── services/    # Business logic implementations
│   ├── database/    # Database connection and session management
│   └── main.py      # Application entry point
├── tests/           # Test files
├── requirements.txt # Python dependencies
├── .env            # Environment variables
├── .gitignore      # Git ignore rules
└── README.md       # This file
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL database connection string
- `SECRET_KEY`: Secret key for JWT token signing
- `BETTER_AUTH_SECRET`: Secret for Better Auth
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: 30)
- `DEBUG`: Enable debug mode (default: 0)

## Running Tests

```bash
pytest
```

## License

[Specify license here]