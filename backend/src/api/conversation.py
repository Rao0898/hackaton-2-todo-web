from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session
from uuid import UUID
from typing import Dict, Any, List
import os
import json

from ..database.database import get_session
from ..services.ai_conversation_service import AIConversationService
from ..services.auth_service import get_current_user_id

router = APIRouter()

@router.post("/")
async def create_conversation(
    request: Request,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Create a new conversation for the current user
    """
    title = "New Conversation"

    try:
        body = await request.json()
        if isinstance(body, dict) and "title" in body:
            title = body.get("title", "New Conversation")
    except Exception:
        # If JSON parsing fails, use default title
        pass

    ai_service = AIConversationService(session)

    result = ai_service.create_conversation(current_user_id, title)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result

@router.get("/")
def get_user_conversations(
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> List[Dict[str, Any]]:
    """
    Get all conversations for the current user
    """
    ai_service = AIConversationService(session)

    conversations = ai_service.get_user_conversations(current_user_id)

    return conversations

@router.get("/{conversation_id}")
def get_conversation(
    conversation_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get a specific conversation by ID
    """
    try:
        # Validate conversation_id format
        UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID format")

    # In a real implementation, we would fetch the specific conversation
    # For now, we'll return a placeholder response
    return {
        "id": conversation_id,
        "title": "Sample Conversation",
        "user_id": current_user_id,
        "created_at": "2026-01-22T00:00:00Z"
    }

@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Delete a specific conversation by ID
    """
    try:
        # Validate conversation_id format
        UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID format")

    # Use the AI conversation service to delete the conversation
    ai_service = AIConversationService(session)
    result = ai_service.delete_conversation(conversation_id)

    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])

    return result