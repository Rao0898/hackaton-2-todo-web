import os
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .api import auth, tasks, chat, conversation
from .database.database import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler to run startup and shutdown events
    """
    # Startup
    print("Creating database tables...")
    db_success = create_db_and_tables()
    if db_success:
        print("Database tables created successfully!")
    else:
        print("Database setup failed, but application continuing...")

    yield

    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title="Phase II: Full-Stack Advanced Todo App API",
    description="API for the Advanced Todo Application with task management, priorities, tags, and recurring tasks",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware - Allow all methods from various origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://hackaton-2-todo-web.vercel.app"
    ],  # Frontend origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, PATCH, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
    # expose_headers=["Access-Control-Allow-Origin"]  # Expose necessary headers if needed
)

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(conversation.router, prefix="/api/conversations", tags=["conversations"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Phase II: Full-Stack Advanced Todo App API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running successfully"}