from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from uuid import UUID
from typing import Dict, Any, List
import os

from ..models.message import MessageRole
from ..models.chat import ChatMessageRequest, ChatResponse
from ..database.database import get_session
from ..services.ai_conversation_service import AIConversationService
from ..services.mcp_server_service import MCPServerService
from ..services.language_detection_service import LanguageDetectionService
from ..services.auth_service import get_current_user_id

router = APIRouter()

@router.post("/conversations")
def create_conversation(
    title: str = "New Conversation",
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Create a new conversation for the current user
    """
    ai_service = AIConversationService(session)

    result = ai_service.create_conversation(current_user_id, title)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result

@router.get("/conversations")
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

@router.post("/conversations/{conversation_id}/messages", response_model=ChatResponse)
async def send_message(
    conversation_id: str,
    request: ChatMessageRequest,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> ChatResponse:
    """
    Send a message to the AI assistant and get a response
    This endpoint implements the stateless architecture by fetching conversation history from DB for every request
    """
    try:
        # Validate conversation_id format
        UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID format")

    # Initialize services
    ai_service = AIConversationService(session, api_key=os.getenv("GEMINI_API_KEY"))
    language_service = LanguageDetectionService()

    # Process the user message and get AI response
    result = await ai_service.process_user_message(conversation_id, current_user_id, request.message_content)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])

    return ChatResponse(
        success=True,
        response=result["response"],
        conversation_id=conversation_id
    )

@router.get("/conversations/{conversation_id}/messages")
def get_conversation_messages(
    conversation_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> List[Dict[str, Any]]:
    """
    Get all messages in a conversation
    """
    try:
        # Validate conversation_id format
        UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID format")

    # Initialize AI service
    ai_service = AIConversationService(session)

    # Get conversation history
    messages = ai_service.get_conversation_history(conversation_id)

    # Additional validation to ensure user owns this conversation
    # In a full implementation, we would verify that the conversation belongs to the current user
    # For now, we rely on proper UUID validation

    return messages

@router.delete("/conversations/{conversation_id}")
def delete_conversation_from_chat(
    conversation_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Delete a specific conversation by ID through the chat API
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

# Additional endpoint to expose MCP tools through the chat API
@router.post("/mcp-tools/add-task")
def add_task_via_chat(
    title: str,
    description: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Endpoint to add task via chat interface using MCP tools
    """
    mcp_service = MCPServerService(session)

    result = mcp_service.add_task(title, description, current_user_id)

    return result

@router.get("/mcp-tools/list-tasks")
def list_tasks_via_chat(
    status_filter: str = "all",
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Endpoint to list tasks via chat interface using MCP tools
    """
    mcp_service = MCPServerService(session)

    result = mcp_service.list_tasks(current_user_id, status_filter)

    return result

@router.post("/mcp-tools/complete-task")
def complete_task_via_chat(
    task_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Endpoint to complete task via chat interface using MCP tools
    """
    mcp_service = MCPServerService(session)

    result = mcp_service.complete_task(task_id)

    return result

@router.post("/mcp-tools/delete-task")
def delete_task_via_chat(
    task_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Endpoint to delete task via chat interface using MCP tools
    """
    mcp_service = MCPServerService(session)

    result = mcp_service.delete_task(task_id)

    return result

@router.post("/mcp-tools/update-task")
def update_task_via_chat(
    task_id: str,
    title: str = None,
    description: str = None,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Endpoint to update task via chat interface using MCP tools
    """
    mcp_service = MCPServerService(session)

    result = mcp_service.update_task(task_id, title, description)

    return result