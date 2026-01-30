# Quickstart Guide: Advanced Todo App

This guide provides step-by-step instructions to set up, configure, and run the Advanced Todo App for development and testing purposes.

## Prerequisites

- Node.js 18+ (for frontend development)
- Python 3.13+ (for backend development)
- PostgreSQL (or Neon PostgreSQL account)
- Git
- npm or yarn package manager

## Environment Setup

### Backend Configuration

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install fastapi uvicorn sqlmodel python-jose[cryptography] passlib[bcrypt] better-auth psycopg2-binary python-multipart python-dotenv
```

3. Create a `.env` file in the backend directory with the following content:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost/dbname
# For Neon: DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require

# Authentication Configuration
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
BETTER_AUTH_SECRET=your-better-auth-secret-here-make-it-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Other Configuration
DEBUG=True
```

### Frontend Configuration

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the frontend directory with the following content:
```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000

# Neon PostgreSQL Database Configuration (for direct access if needed)
NEON_DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
```

## Installation & Execution

### Starting the Backend Server

1. Ensure you're in the backend directory:
```bash
cd backend
```

2. Start the backend server:
```bash
uvicorn src.main:app --reload --port 8000
```

The backend server will be available at `http://localhost:8000`.

### Starting the Frontend Server

1. Ensure you're in the frontend directory:
```bash
cd ../frontend
```

2. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`.

## Running the Application

1. Start the backend server (port 8000)
2. Start the frontend server (port 3000)
3. Access the application at http://localhost:3000

## Testing the Application

### Backend API Tests

Run backend tests using pytest:
```bash
cd backend
pytest
```

### Frontend Tests

Run frontend tests:
```bash
cd frontend
npm test
# or
yarn test
```

## Key Features to Test

### Automated Recurring Tasks
1. Create a task with a recurrence pattern (daily, weekly, monthly, or yearly)
2. Mark the task as complete
3. Verify that a new instance of the task is created according to the recurrence pattern

### Multi-user Isolation
1. Register two different users
2. Log in as each user separately
3. Verify that each user only sees their own tasks
4. Confirm that user data is properly isolated

### Priority Management
1. Create tasks with different priority levels (High, Medium, Low)
2. Verify visual distinction of priority levels in the UI
3. Test priority filtering functionality

### Search and Filter
1. Create multiple tasks with different tags and content
2. Use the search functionality to find specific tasks
3. Test filtering by priority, tags, and due dates

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct in `.env`
2. **CORS Issues**: Make sure frontend port (3000) is added to backend CORS settings
3. **Authentication**: Verify that JWT secret keys match between frontend and backend
4. **API Connection**: Confirm that NEXT_PUBLIC_API_BASE_URL points to the correct backend address

### Resetting Data
- To reset the database, drop and recreate tables
- Clear browser storage to reset authentication state
- Restart both frontend and backend servers after making configuration changes

## Production Deployment

For production deployment:
1. Change `DEBUG=False` in backend `.env`
2. Use secure, long random strings for SECRET_KEY and BETTER_AUTH_SECRET
3. Configure proper SSL certificates for HTTPS
4. Set up a reverse proxy (nginx) for production