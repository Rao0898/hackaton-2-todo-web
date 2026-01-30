from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid
from enum import Enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .conversation import Conversation

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class MessageBase(SQLModel):
    conversation_id: uuid.UUID
    role: MessageRole  # Either "user" or "assistant"
    content: str

class Message(MessageBase, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(
        foreign_key="conversations.id",
        nullable=False,
        index=True
    )  # Links to conversation
    role: MessageRole
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to conversation
    conversation: "Conversation" = Relationship(back_populates="messages")

class MessageRead(MessageBase):
    id: uuid.UUID
    created_at: datetime

class MessageCreate(MessageBase):
    pass