# TaskFlow App - Quick Start Guide

Welcome to TaskFlow! This guide will help you set up, run, and test the full-stack advanced todo application with real-time notifications.

## 1. Setup & Installation

### Backend (FastAPI)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install the required packages:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the backend server:**
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```

   The backend will be available at `http://localhost:8000`.

### Frontend (Next.js)

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install the required packages:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`.

## 2. Testing Authentication

1. **Register a new account:**
   - Navigate to `http://localhost:3000`
   - Click on "Dashboard" to go to the login page
   - Click "Sign up" and register with a valid email and password

2. **Login to your account:**
   - Use the credentials you registered with
   - After successful login, you'll be redirected to the dashboard

3. **Verify user email in sidebar:**
   - Navigate to the dashboard (`http://localhost:3000/dashboard`)
   - Look at the bottom of the left sidebar
   - You should see your email address displayed with a user icon (`👤`) below the Logout button
   - The email should appear in small, muted text (`text-xs text-gray-400`)

## 3. Testing Tasks & Notifications

### Adding a Task

1. **On the Dashboard (Inbox) page:**
   - Find the "Add a new task..." input field
   - Enter a task title (e.g., "Test notification")
   - Select a priority (Low, Medium, High)
   - In the datetime picker, set a due date/time:
     - For testing notifications, set it to 15 minutes from now
   - Add tags in the "Tags (comma separated)" field (e.g., "test,important")

2. **Click "Add Task"**

### Verifying Real-time Updates

1. **After adding a task, it should appear immediately in the task list**
2. **The task should show:**
   - Title
   - Priority badge
   - Tags as small badges
   - Due date and time in readable format
3. **No page refresh should be required**

### Testing Notifications

1. **Create a task with a due date/time within 1 hour:**
   - Set due date/time to 15 minutes from current time
   - Add the task

2. **Check for notification indicators:**
   - Look at the bell icon in the top-right corner of the dashboard
   - After ~2 minutes (when the automatic refresh occurs), you should see:
     - A red badge with notification count on the bell icon
     - A dropdown appearing when clicking the bell icon showing your upcoming task
     - A browser notification popup (if browser notifications are enabled)

3. **View notifications:**
   - Click the bell icon to see the dropdown menu
   - You should see your upcoming task(s) listed with title and due time

## 4. Database & Server Management

### Database Cleanup

- **Delete Old Database Safely**:
  1. Stop the backend server (Ctrl+C)
  2. Navigate to the backend directory:
     ```bash
     cd backend
     ```
  3. Remove the old database file (if using SQLite):
     ```bash
     rm todo_app.db
     ```
  4. If using PostgreSQL (Neon), you can clear tables via SQL commands or recreate the database

### Server Restart

- **Restart FastAPI Server**:
  1. Stop the current server (Ctrl+C)
  2. Activate your virtual environment:
     ```bash
     # On Windows
     venv\Scripts\activate
     # On macOS/Linux
     source venv/bin/activate
     ```
  3. Navigate to the backend directory:
     ```bash
     cd backend
     ```
  4. Start the server:
     ```bash
     uvicorn src.main:app --reload --port 8000
     ```

## 5. Testing Authentication & Tasks

### Complete Flow Test

**Step 1: Signup (New Account)**
1. Navigate to `http://localhost:3000/signup`
2. Fill in email, password, and name
3. Click "Sign Up"
4. Verify you're redirected to `/home` after successful signup

**Step 2: Login**
1. Navigate to `http://localhost:3000/login`
2. Enter your signup credentials
3. Click "Sign In"
4. Verify you're redirected to `/home` after successful login

**Step 3: Add Task**
1. On the home page, find the "Add a new task..." form
2. Enter a task title (e.g., "Test task")
3. Select priority (Low, Medium, High)
4. Optionally add tags and due date
5. Click "Add Task"
6. Verify the task appears in your task list

## 6. Testing Guide Checklist

### Verify 'Add Task' POST Request
- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Add a task using the form
- [ ] Look for POST request to `/api/tasks/`
- [ ] Verify request headers include:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- [ ] Verify request body contains:
  - `title`, `priority`, `tags` (as array), `due_date` (optional)
- [ ] Check response status is 200 OK
- [ ] Verify response contains the created task data

### Verify Token Authentication
- [ ] After login/signup, check localStorage in Application tab
- [ ] Look for `access_token` or `token` key
- [ ] Verify the token is included in Authorization header of subsequent requests
- [ ] Test that unauthenticated requests return 401 Unauthorized
- [ ] Verify logout clears the token from localStorage

### Test User Isolation
- [ ] Login with one account and create tasks
- [ ] Logout and login with different account
- [ ] Verify the new account sees only its own tasks, not the previous user's tasks

## 7. CORS Configuration Check

### Frontend Environment
Your frontend `.env.local` file should contain:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://127.0.0.1:8000
```

### Backend CORS Settings (Already Configured)
The backend is configured to allow:
- Origins: `http://localhost:3000` and `http://127.0.0.1:3000`
- Methods: All methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, etc.)
- Credentials: Enabled for proper token handling

### No Frontend Changes Needed
- ✅ Your existing CORS settings are correct
- ✅ No changes needed in frontend .env files
- ✅ Backend allows all necessary methods from your frontend origin

## 8. Debugging Common Issues

### Authentication Issues

- **Redirect Loop**: If you're experiencing redirect loops after login/logout:
 1. Open your browser's Developer Tools (F12)
 2. Go to the "Application" tab (Chrome) or "Storage" tab (Firefox)
 3. Clear Local Storage by selecting "Clear all" or deleting individual keys
 4. Refresh the page and try logging in again

### Network Issues

- **401 Unauthorized Errors**: Check the browser console (F12) for:
 - Expired tokens in localStorage
 - Missing Authorization headers
 - Backend server not running on port 8000

- **Connection Issues**:
 - Ensure the backend is running on `http://localhost:8000`
 - Verify the frontend is configured to connect to the correct backend URL
 - Check that CORS settings allow connections from `http://localhost:3000`

### Frontend Issues

- **Component Not Rendering**:
 - Check the browser console for JavaScript errors
 - Verify all required dependencies are installed (`npm install`)
 - Restart the development server (`npm run dev`)

- **Missing Task Details**:
 - Verify the backend is returning the correct data structure
 - Check that the `due_date` and `tags` fields are properly included in API responses

### Backend Issues

- **Database Connection Errors**:
 - Ensure your database connection string is properly configured
 - Verify the database server is running and accessible

- **API Endpoint Not Found**:
 - Confirm that the `/api/tasks/` endpoint is available
 - Check the backend logs for any startup errors

### General Troubleshooting Steps

1. **Always restart both servers** when making configuration changes
2. **Clear browser cache and cookies** if experiencing persistent issues
3. **Check both backend and frontend logs** for error messages
4. **Verify port availability** (8000 for backend, 3000 for frontend)
5. **Confirm environment variables** are properly set if required

---

If you continue to experience issues, please check the console logs in your browser's developer tools (F12) for detailed error messages, and verify that both the backend and frontend servers are running properly.