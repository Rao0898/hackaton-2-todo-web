import { Message } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

// Ensure API_BASE_URL doesn't start with 'undefined' or is actually undefined
const getValidApiBaseUrl = () => {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL === 'undefined') {
    // Fallback to a default value or try to construct from window.location in browser
    if (typeof window !== 'undefined') {
      // In development, typically backend runs on port 8000
      // In production, might be on the same host but different path
      return 'http://127.0.0.1:8000'; // Default fallback
    }
    return 'http://127.0.0.1:8000';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL;
};

/**
 * Creates a new conversation
 */
export const createConversation = async (title: string = "New Conversation"): Promise<{ success: boolean; message: string; conversation_id?: string }> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getValidApiBaseUrl()}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Gets all conversations for the current user
 */
export const getUserConversations = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getValidApiBaseUrl()}/api/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

/**
 * Sends a message to the AI assistant
 */
export const sendMessage = async (conversationId: string, messageContent: string): Promise<{ success: boolean; response?: string; message: string }> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getValidApiBaseUrl()}/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message_content: messageContent,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Gets all messages in a conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getValidApiBaseUrl()}/api/chat/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

/**
 * Adds a task via the chat interface
 */
export const addTaskViaChat = async (title: string, description: string): Promise<any> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getValidApiBaseUrl()}/api/chat/mcp-tools/add-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding task via chat:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Lists tasks via the chat interface
 */
export const listTasksViaChat = async (statusFilter: string = 'all'): Promise<any> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getValidApiBaseUrl()}/api/chat/mcp-tools/list-tasks?status_filter=${statusFilter}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error listing tasks via chat:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Completes a task via the chat interface
 */
export const completeTaskViaChat = async (taskId: string): Promise<any> => {
  try {
    // Map the task input (either index or UUID) to the actual UUID
    const { mapTaskInputToUUID } = await import('@/utils/taskUtils');
    const actualTaskId = await mapTaskInputToUUID(taskId);

    if (!actualTaskId) {
      throw new Error(`Task with identifier '${taskId}' not found`);
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getValidApiBaseUrl()}/api/chat/mcp-tools/complete-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        task_id: actualTaskId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error completing task via chat:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Deletes a task via the chat interface
 */
export const deleteTaskViaChat = async (taskId: string): Promise<any> => {
  try {
    // Map the task input (either index or UUID) to the actual UUID
    const { mapTaskInputToUUID } = await import('@/utils/taskUtils');
    const actualTaskId = await mapTaskInputToUUID(taskId);

    if (!actualTaskId) {
      throw new Error(`Task with identifier '${taskId}' not found`);
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getValidApiBaseUrl()}/api/chat/mcp-tools/delete-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        task_id: actualTaskId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting task via chat:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Updates a task via the chat interface
 */
export const updateTaskViaChat = async (taskId: string, title?: string, description?: string): Promise<any> => {
  try {
    // Map the task input (either index or UUID) to the actual UUID
    const { mapTaskInputToUUID } = await import('@/utils/taskUtils');
    const actualTaskId = await mapTaskInputToUUID(taskId);

    if (!actualTaskId) {
      throw new Error(`Task with identifier '${taskId}' not found`);
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getValidApiBaseUrl()}/api/chat/mcp-tools/update-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        task_id: actualTaskId,
        title,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating task via chat:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};