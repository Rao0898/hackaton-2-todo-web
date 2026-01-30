from typing import Dict, Any, List
from sqlmodel import Session, select
from uuid import UUID
import os
import re
import asyncio
from datetime import datetime
from ..models.conversation import Conversation, ConversationCreate
from ..models.message import Message, MessageCreate, MessageRole
from .mcp_server_service import MCPServerService

# Import Google Generative AI
import google.generativeai as genai

class AIConversationService:
    """
    Service for handling AI-powered conversations
    """

    def __init__(self, session: Session, api_key: str = None):
        self.session = session
        # Configure Google Generative AI with the API key
        gemini_api_key = api_key or os.getenv("GEMINI_API_KEY")
        if gemini_api_key:
            # Configure with the API key
            genai.configure(api_key=gemini_api_key)
            # Initialize the model for Gemini 2.0 Flash
            self.model = genai.GenerativeModel('gemini-2.0-flash')
        else:
            raise ValueError("GEMINI_API_KEY environment variable is required")

    def _send_message_sync(self, chat, content):
        """
        Helper method to send a message synchronously
        """
        return chat.send_message(content)

    async def _send_message_async(self, chat, content):
        """
        Helper method to send a message asynchronously
        """
        # Since the Google Generative AI SDK doesn't have native async methods,
        # we'll use asyncio to run the sync method in a thread pool
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._send_message_sync, chat, content)

    def create_conversation(self, user_id: str, title: str = "New Conversation") -> Dict[str, Any]:
        """
        Create a new conversation for the user

        Args:
            user_id: ID of the user creating the conversation
            title: Title for the conversation

        Returns:
            Dictionary with conversation information
        """
        try:
            # Convert user_id to UUID
            user_uuid = UUID(user_id)

            # Create conversation
            conversation_data = ConversationCreate(
                title=title,
                user_id=user_uuid
            )

            db_conversation = Conversation.from_orm(conversation_data) if hasattr(ConversationCreate, 'from_orm') else Conversation(**conversation_data.dict())

            self.session.add(db_conversation)
            self.session.commit()
            self.session.refresh(db_conversation)

            return {
                "success": True,
                "message": "Conversation created successfully",
                "conversation_id": str(db_conversation.id)
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error creating conversation: {str(e)}"
            }

    def get_conversation_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve the full conversation history from the database

        Args:
            conversation_id: ID of the conversation to retrieve

        Returns:
            List of messages in chronological order
        """
        try:
            # Convert conversation_id to UUID
            conv_uuid = UUID(conversation_id)

            # Get all messages for this conversation, ordered by creation time
            statement = select(Message).where(Message.conversation_id == conv_uuid).order_by(Message.created_at)
            messages = self.session.exec(statement).all()

            # Format messages for AI consumption
            formatted_messages = []
            for msg in messages:
                formatted_messages.append({
                    "role": msg.role.value if hasattr(msg.role, 'value') else msg.role,
                    "content": msg.content
                })

            return formatted_messages
        except Exception as e:
            print(f"Error retrieving conversation history: {str(e)}")
            return []

    def add_message_to_conversation(self, conversation_id: str, role: MessageRole, content: str) -> Dict[str, Any]:
        """
        Add a message to the conversation

        Args:
            conversation_id: ID of the conversation
            role: Role of the message sender (user or assistant)
            content: Content of the message

        Returns:
            Dictionary with operation result
        """
        try:
            # Convert conversation_id to UUID
            conv_uuid = UUID(conversation_id)

            # Create message
            message_data = MessageCreate(
                conversation_id=conv_uuid,
                role=role,
                content=content
            )

            db_message = Message.from_orm(message_data) if hasattr(MessageCreate, 'from_orm') else Message(**message_data.dict())

            self.session.add(db_message)
            self.session.commit()
            self.session.refresh(db_message)

            return {
                "success": True,
                "message": "Message added successfully",
                "message_id": str(db_message.id)
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error adding message: {str(e)}"
            }

    async def process_user_message(self, conversation_id: str, user_id: str, user_message: str) -> Dict[str, Any]:
        """
        Process a user message and generate an AI response

        Args:
            conversation_id: ID of the conversation
            user_id: ID of the user sending the message
            user_message: Content of the user's message

        Returns:
            Dictionary with AI response
        """
        try:
            # Add user message to conversation
            user_msg_result = self.add_message_to_conversation(
                conversation_id,
                MessageRole.USER,
                user_message
            )

            if not user_msg_result["success"]:
                return user_msg_result

            # Get full conversation history (stateless - fetch from DB every time)
            conversation_history = self.get_conversation_history(conversation_id)

            # 1. Setup History - Convert DB records to Gemini format
            history = []
            for msg in conversation_history:
                # Map role names: assistant -> model, user -> user
                gemini_role = "model" if msg["role"] == "assistant" else "user"
                history.append({"role": gemini_role, "parts": [{"text": msg["content"]}]})

            # 2. System instruction - Define system instruction
            system_instruction = """You are a helpful productivity assistant focused on helping users manage their tasks.
            You can help users add, list, complete, update, and delete tasks.
            Stay focused on task management and productivity.
            If asked about other topics, politely redirect to task management.
            Respond in the same language as the user (support English, Urdu, and Roman Urdu)."""

            # 3. Initialize the generative model with tools and system instruction
            tools = [
                {
                    "function_declarations": [
                        {
                            "name": "add_task",
                            "description": "Add a new task to the user's task list",
                            "parameters": {
                                "type": "OBJECT",
                                "properties": {
                                    "title": {
                                        "type": "STRING",
                                        "description": "Title of the task"
                                    },
                                    "description": {
                                        "type": "STRING",
                                        "description": "Description of the task"
                                    },
                                    "due_date": {
                                        "type": "STRING",
                                        "description": "Due date of the task in YYYY-MM-DD format"
                                    },
                                    "time": {
                                        "type": "STRING",
                                        "description": "Time of the task in HH:MM format"
                                    }
                                },
                                "required": ["title", "description"]
                            }
                        },
                        {
                            "name": "list_tasks",
                            "description": "List all tasks for the user",
                            "parameters": {
                                "type": "OBJECT",
                                "properties": {
                                    "status_filter": {
                                        "type": "STRING",
                                        "description": "Filter for task status: 'all', 'pending', or 'completed'"
                                    }
                                }
                            }
                        },
                        {
                            "name": "complete_task",
                            "description": "Mark a task as complete",
                            "parameters": {
                                "type": "OBJECT",
                                "properties": {
                                    "task_id": {
                                        "type": "STRING",
                                        "description": "ID of the task to mark as complete"
                                    }
                                },
                                "required": ["task_id"]
                            }
                        },
                        {
                            "name": "update_task",
                            "description": "Update a task's title or description",
                            "parameters": {
                                "type": "OBJECT",
                                "properties": {
                                    "task_id": {
                                        "type": "STRING",
                                        "description": "ID of the task to update"
                                    },
                                    "title": {
                                        "type": "STRING",
                                        "description": "New title for the task (optional)"
                                    },
                                    "description": {
                                        "type": "STRING",
                                        "description": "New description for the task (optional)"
                                    }
                                },
                                "required": ["task_id"]
                            }
                        },
                        {
                            "name": "delete_task",
                            "description": "Delete a task",
                            "parameters": {
                                "type": "OBJECT",
                                "properties": {
                                    "task_id": {
                                        "type": "STRING",
                                        "description": "ID of the task to delete"
                                    }
                                },
                                "required": ["task_id"]
                            }
                        }
                    ]
                }
            ]

            # Create a new model instance with system instruction and tools
            model = genai.GenerativeModel(
                model_name='gemini-2.0-flash',
                system_instruction=system_instruction,
                tools=tools
            )

            # 2. Initialize Chat with history
            chat = model.start_chat(history=history)

            # 3. Recursive/Looping Tool Handling
            try:
                print("DEBUG: Sending request to Gemini...")
                # Use async version of send_message
                response = await self._send_message_async(chat, [{"text": user_message}])

                # Process the response for function calls
                has_function_call = False
                while True:
                    # Check for function calls in the response
                    function_calls_found = False
                    for part in response.candidates[0].content.parts if response.candidates else []:
                        if hasattr(part, 'function_call'):
                            function_calls_found = True
                            has_function_call = True
                            fc = part.function_call

                            # Create MCP service instance to execute the function
                            mcp_service = MCPServerService(self.session)

                            # Execute the appropriate function based on name
                            if fc.name == "add_task":
                                title = fc.args.get("title", "Untitled Task")
                                description = fc.args.get("description", "")
                                due_date = fc.args.get("due_date")
                                time_param = fc.args.get("time")

                                # Pass due_date and time to the add_task function
                                result = mcp_service.add_task(title, description, user_id, due_date=due_date, time=time_param)

                                if result["success"]:
                                    tool_output = f"Successfully added task '{title}' to your list."
                                else:
                                    tool_output = f"Error adding task: {result['message']}"

                            elif fc.name == "list_tasks":
                                status_filter = fc.args.get("status_filter", "all")

                                # Fetch tasks with consistent ordering (by created_at)
                                result = mcp_service.list_tasks(user_id, status_filter)

                                if result["success"]:
                                    tasks = result["tasks"]
                                    if tasks:
                                        # Sort by created_at to ensure consistent indexing
                                        tasks_sorted = sorted(tasks, key=lambda x: x.get('created_at', ''), reverse=False)
                                        task_list_str = "\n".join([f"[{idx+1}] {task.get('title', 'Untitled')} - {task.get('description', '')}" for idx, task in enumerate(tasks_sorted)])
                                        tool_output = f"Your tasks:\n{task_list_str}"
                                    else:
                                        tool_output = "You don't have any tasks right now."
                                else:
                                    tool_output = f"Error listing tasks: {result['message']}"

                            elif fc.name == "complete_task":
                                task_id = fc.args.get("task_id")

                                # Check if task_id is an integer/index instead of UUID
                                uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)

                                if not uuid_pattern.match(str(task_id)):
                                    # task_id is not a UUID, treat as an index
                                    try:
                                        task_index = int(task_id) - 1  # Convert to 0-based index

                                        # Fetch the current task list with consistent ordering
                                        tasks_result = mcp_service.list_tasks(user_id)
                                        if tasks_result["success"]:
                                            # Sort by created_at to ensure consistent indexing
                                            tasks = sorted(tasks_result["tasks"], key=lambda x: x.get('created_at', ''), reverse=False)
                                            if 0 <= task_index < len(tasks):
                                                actual_task_id = tasks[task_index]["id"]
                                                result = mcp_service.complete_task(actual_task_id)
                                            else:
                                                result = {
                                                    "success": False,
                                                    "message": f"Task with index {task_id} not found. Available tasks: {len(tasks)}."
                                                }
                                        else:
                                            result = {
                                                "success": False,
                                                "message": f"Could not fetch task list: {tasks_result['message']}"
                                            }
                                    except ValueError:
                                        result = {
                                            "success": False,
                                            "message": f"Invalid task identifier: {task_id}"
                                        }
                                else:
                                    # task_id is already a UUID, proceed normally
                                    result = mcp_service.complete_task(task_id)

                                if result["success"]:
                                    tool_output = "Task marked as complete successfully!"
                                else:
                                    tool_output = f"Error completing task: {result['message']}"

                            elif fc.name == "update_task":
                                task_id = fc.args.get("task_id")
                                title = fc.args.get("title")
                                description = fc.args.get("description")

                                # Check if task_id is an integer/index instead of UUID
                                uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)

                                if not uuid_pattern.match(str(task_id)):
                                    # task_id is not a UUID, treat as an index
                                    try:
                                        task_index = int(task_id) - 1  # Convert to 0-based index

                                        # Fetch the current task list with consistent ordering
                                        tasks_result = mcp_service.list_tasks(user_id)
                                        if tasks_result["success"]:
                                            # Sort by created_at to ensure consistent indexing
                                            tasks = sorted(tasks_result["tasks"], key=lambda x: x.get('created_at', ''), reverse=False)
                                            if 0 <= task_index < len(tasks):
                                                actual_task_id = tasks[task_index]["id"]
                                                result = mcp_service.update_task(actual_task_id, title, description)
                                            else:
                                                result = {
                                                    "success": False,
                                                    "message": f"Task with index {task_id} not found. Available tasks: {len(tasks)}."
                                                }
                                        else:
                                            result = {
                                                "success": False,
                                                "message": f"Could not fetch task list: {tasks_result['message']}"
                                            }
                                    except ValueError:
                                        result = {
                                            "success": False,
                                            "message": f"Invalid task identifier: {task_id}"
                                        }
                                else:
                                    # task_id is already a UUID, proceed normally
                                    result = mcp_service.update_task(task_id, title, description)

                                if result["success"]:
                                    tool_output = "Task updated successfully!"
                                else:
                                    tool_output = f"Error updating task: {result['message']}"

                            elif fc.name == "delete_task":
                                task_id = fc.args.get("task_id")

                                # Check if task_id is an integer/index instead of UUID
                                uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)

                                if not uuid_pattern.match(str(task_id)):
                                    # task_id is not a UUID, treat as an index
                                    try:
                                        task_index = int(task_id) - 1  # Convert to 0-based index

                                        # Fetch the current task list with consistent ordering
                                        tasks_result = mcp_service.list_tasks(user_id)
                                        if tasks_result["success"]:
                                            # Sort by created_at to ensure consistent indexing
                                            tasks = sorted(tasks_result["tasks"], key=lambda x: x.get('created_at', ''), reverse=False)
                                            if 0 <= task_index < len(tasks):
                                                actual_task_id = tasks[task_index]["id"]
                                                result = mcp_service.delete_task(actual_task_id)
                                            else:
                                                result = {
                                                    "success": False,
                                                    "message": f"Task with index {task_id} not found. Available tasks: {len(tasks)}."
                                                }
                                        else:
                                            result = {
                                                "success": False,
                                                "message": f"Could not fetch task list: {tasks_result['message']}"
                                            }
                                    except ValueError:
                                        result = {
                                            "success": False,
                                            "message": f"Invalid task identifier: {task_id}"
                                        }
                                else:
                                    # task_id is already a UUID, proceed normally
                                    result = mcp_service.delete_task(task_id)

                                if result["success"]:
                                    tool_output = "Task deleted successfully!"
                                else:
                                    tool_output = f"Error deleting task: {result['message']}"
                            else:
                                tool_output = f"Unknown function: {fc.name}"

                            # Send function result back to model
                            print("DEBUG: Sending function result to Gemini...")
                            function_response_content = {
                                "role": "function",
                                "parts": [{
                                    "function_response": {
                                        "name": fc.name,
                                        "response": {"result": tool_output}
                                    }
                                }]
                            }
                            response = await self._send_message_async(chat, [function_response_content])

                            break  # Process one function call at a time
                    if not function_calls_found:
                        break  # Exit the loop when no more function calls are found

                # Final response after all function calls are processed
                ai_response = ""
                if hasattr(response, 'candidates') and response.candidates and response.candidates[0].content.parts:
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, 'text'):
                            ai_response += part.text
                else:
                    ai_response = "I couldn't generate a response. How else can I help you with your tasks?"

            except Exception as e:
                # Print the full exception object for debugging
                print(f"GEMINI ERROR OBJECT: {repr(e)}")
                print(f"GEMINI ERROR STRING: {str(e)}")

                # Fallback response if Gemini API fails
                error_msg = str(e).lower()

                if '429' in error_msg or 'quota' in error_msg or 'rate limit' in error_msg:
                    # QUOTA_ERROR: Return specific message for rate limit/quota errors
                    ai_response = "Daily API quota reached. Please try again later."
                elif '401' in error_msg or '403' in error_msg or 'api_key_invalid' in error_msg.lower():
                    # AUTH_ERROR: Return specific message for authentication errors
                    ai_response = "AUTH_ERROR: Your API key is invalid or not activated."
                elif 'connection' in error_msg or 'network' in error_msg or 'timeout' in error_msg or 'dns' in error_msg:
                    # NETWORK_ERROR: Return specific message for connection errors
                    ai_response = "NETWORK_ERROR: I cannot reach Google servers. Please check your internet or try a Hotspot."
                else:
                    # For any other error, return the actual error message
                    ai_response = str(e)

            # Add AI response to conversation
            ai_msg_result = self.add_message_to_conversation(
                conversation_id,
                MessageRole.ASSISTANT,
                ai_response
            )

            if not ai_msg_result["success"]:
                return ai_msg_result

            # Check if this is the first message of the conversation and title is 'New Conversation'
            # If so, we would normally generate a new title based on the user's message, but we're disabling
            # this to prevent additional API calls that exhaust the rate limit
            # Title generation is now skipped to prevent simultaneous API calls

            return {
                "success": True,
                "response": ai_response
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error processing message: {str(e)}"
            }

    def update_conversation_title(self, conversation_id: str, new_title: str) -> Dict[str, Any]:
        """
        Update the title of a conversation

        Args:
            conversation_id: ID of the conversation to update
            new_title: New title for the conversation

        Returns:
            Dictionary with operation result
        """
        try:
            # Convert conversation_id to UUID
            conv_uuid = UUID(conversation_id)

            # Find the conversation
            statement = select(Conversation).where(Conversation.id == conv_uuid)
            conversation = self.session.exec(statement).first()

            if not conversation:
                return {
                    "success": False,
                    "message": "Conversation not found"
                }

            # Update the title
            conversation.title = new_title
            conversation.updated_at = datetime.utcnow()

            # Commit the changes
            self.session.add(conversation)
            self.session.commit()
            self.session.refresh(conversation)

            return {
                "success": True,
                "message": "Conversation title updated successfully",
                "conversation": {
                    "id": str(conversation.id),
                    "title": conversation.title,
                    "updated_at": conversation.updated_at.isoformat()
                }
            }
        except Exception as e:
            # Rollback in case of error
            self.session.rollback()
            return {
                "success": False,
                "message": f"Error updating conversation title: {str(e)}"
            }

    def get_user_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all conversations for a specific user

        Args:
            user_id: ID of the user

        Returns:
            List of user's conversations
        """
        try:
            # Convert user_id to UUID
            user_uuid = UUID(user_id)

            # Get all conversations for this user
            statement = select(Conversation).where(Conversation.user_id == user_uuid).order_by(Conversation.updated_at.desc())
            conversations = self.session.exec(statement).all()

            # Format conversations for response
            formatted_conversations = []
            for conv in conversations:
                formatted_conversations.append({
                    "id": str(conv.id),
                    "title": conv.title,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat()
                })

            return formatted_conversations
        except Exception as e:
            print(f"Error retrieving user conversations: {str(e)}")
            return []

    def delete_conversation(self, conversation_id: str) -> Dict[str, Any]:
        """
        Delete a specific conversation and all its messages

        Args:
            conversation_id: ID of the conversation to delete

        Returns:
            Dictionary with operation result
        """
        try:
            # Convert conversation_id to UUID
            conv_uuid = UUID(conversation_id)

            # First, delete all messages associated with this conversation
            from sqlmodel import delete
            message_delete_statement = delete(Message).where(Message.conversation_id == conv_uuid)
            self.session.exec(message_delete_statement)

            # Then, delete the conversation itself
            conversation_delete_statement = delete(Conversation).where(Conversation.id == conv_uuid)
            result = self.session.exec(conversation_delete_statement)

            # Commit the transaction to persist changes
            self.session.commit()

            if result.rowcount > 0:
                return {
                    "success": True,
                    "message": "Conversation and its messages deleted successfully"
                }
            else:
                return {
                    "success": False,
                    "message": "Conversation not found"
                }
        except Exception as e:
            # Rollback in case of error
            self.session.rollback()
            return {
                "success": False,
                "message": f"Error deleting conversation: {str(e)}"
            }