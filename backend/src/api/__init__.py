from fastapi import APIRouter
from . import auth, tasks, chat, conversation

api_router = APIRouter()

# Include the existing routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])

# Include the new chat routers
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(conversation.router, prefix="/conversations", tags=["conversations"])