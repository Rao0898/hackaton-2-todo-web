from pydantic import BaseModel
from typing import Optional


class ChatMessageRequest(BaseModel):
    message_content: str


class ChatResponse(BaseModel):
    success: bool
    response: str
    conversation_id: Optional[str] = None