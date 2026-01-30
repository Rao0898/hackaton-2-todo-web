from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from .message import Message

class ConversationBase(SQLModel):
    title: str
    user_id: uuid.UUID  # For user isolation - ensures users only access their own conversations

class Conversation(ConversationBase, table=True):
    __tablename__ = "conversations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True)  # Links to authenticated user
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to messages
    messages: List["Message"] = Relationship(back_populates="conversation")

class ConversationRead(ConversationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(SQLModel):
    title: str