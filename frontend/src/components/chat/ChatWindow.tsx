'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatWindow = ({ onClose, onTaskAdded }: { onClose: () => void, onTaskAdded?: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<{id: string, title: string, createdAt: string}[]>([]);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationInitializedRef = useRef(false); // Track if conversation has been initialized
  const { getToken, logout } = useAuth();
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No access token found');
        // Redirect to login if no token
        router.push('/login');
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/chat/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Token may have expired');
          // Clear token and redirect to login page
          logout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the conversation data to match our state format
      let transformedConversations = data.map((conv: any) => ({
        id: conv.id,
        title: conv.title,
        createdAt: conv.created_at
      }));

      // Auto-cleanup of empty conversations has been removed to prevent race conditions
      // where newly created conversations are deleted before the user can interact with them
      // Conversations will now only be deleted when explicitly requested by the user

      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversationMessages = async (convId: string) => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No access token found');
        // Redirect to login if no token
        router.push('/login');
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/chat/conversations/${convId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Token may have expired');
          // Clear token and redirect to login page
          logout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the messages to match our Message interface
      const transformedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at || Date.now()),
      }));

      setMessages(transformedMessages);
      setConversationId(convId);
      setShowHistorySidebar(false); // Close sidebar after selecting conversation
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  const toggleHistorySidebar = () => {
    if (!showHistorySidebar) {
      loadConversations(); // Load conversations when opening sidebar
    }
    setShowHistorySidebar(!showHistorySidebar);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation when the component mounts
  useEffect(() => {
    // Prevent multiple initializations using ref
    if (conversationInitializedRef.current) {
      return;
    }

    conversationInitializedRef.current = true;

    const initializeConversation = async () => {
      try {
        // Check if there's a persisted conversation in localStorage
        const persistedState = localStorage.getItem('activeConversation');
        if (persistedState) {
          try {
            const { conversationId: savedConvId, isActive } = JSON.parse(persistedState);
            if (savedConvId && isActive) {
              // Load the existing conversation
              setConversationId(savedConvId);

              // Load the conversation messages
              const token = getToken();
              if (token) {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
                const response = await fetch(`${baseUrl}/api/chat/conversations/${savedConvId}/messages`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                });

                if (!response.ok) {
                  if (response.status === 401) {
                    console.error('Unauthorized: Token may have expired');
                    // Clear token and redirect to login page
                    logout();
                    return;
                  }
                } else {
                  const data = await response.json();
                  const transformedMessages: Message[] = data.map((msg: any) => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: new Date(msg.created_at || Date.now()),
                  }));
                  setMessages(transformedMessages);

                  // Also load the conversations list to keep the sidebar updated
                  await loadConversations();
                }
              }
              return;
            }
          } catch (parseError) {
            console.error('Error parsing persisted conversation state:', parseError);
          }
        }

        // Only create a new conversation if there's no active one in localStorage
        if (!conversationId) {
          const token = getToken();
          if (!token) {
            console.error('No access token found');
            // Redirect to login if no token
            router.push('/login');
            return;
          }

          // Try to create a new conversation
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
          const response = await fetch(`${baseUrl}/api/conversations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: "New Conversation"
            }),
          });

          if (!response.ok) {
            if (response.status === 401) {
              console.error('Unauthorized: Token may have expired');
              // Clear token and redirect to login page
              logout();
              return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success && data.conversation_id) {
            setConversationId(data.conversation_id);

            // Store the active conversation in localStorage
            const state = {
              conversationId: data.conversation_id,
              isActive: true,
              timestamp: Date.now()
            };
            localStorage.setItem('activeConversation', JSON.stringify(state));

            // Load conversations to update the sidebar
            await loadConversations();
          } else {
            throw new Error(data.message || 'Failed to create conversation');
          }
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        // Create a temporary conversation ID if creation fails
        setConversationId(`temp-${Date.now()}`);
      }
    };

    initializeConversation();
  }, []); // Run only on component mount

  
  // Function to save chat state to localStorage
  const saveChatState = (isOpen: boolean) => {
    if (conversationId) {
      const state = {
        conversationId,
        isActive: isOpen,
        timestamp: Date.now()
      };
      localStorage.setItem('activeConversation', JSON.stringify(state));
    }

    // Also save the open/closed state separately for the floating button
    localStorage.setItem('isChatOpen', JSON.stringify(isOpen));
  };

  // Function to clear chat state from localStorage
  const clearChatState = () => {
    localStorage.removeItem('activeConversation');
  };

  const handleClose = () => {
    saveChatState(false); // Save state as closed but keep conversation for later
    onClose();
  };

  const deleteConversation = async (convId: string) => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No access token found');
        // Redirect to login if no token
        router.push('/login');
        return;
      }

      // Delete the conversation
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/chat/conversations/${convId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Token may have expired');
          // Clear token and redirect to login page
          logout();
          return;
        }
        // Try to reload conversations anyway to refresh the state
        await loadConversations();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // If response is OK, remove the conversation from local state immediately
      setConversations(prev => prev.filter(conv => conv.id !== convId));

      // If we're currently viewing the deleted conversation, clear the messages
      if (conversationId === convId) {
        setMessages([]);
        // Optionally create a new conversation or clear the conversation ID
        setConversationId(null);

        // Clear the active conversation from localStorage
        localStorage.removeItem('activeConversation');
      }

      // Reload conversations to sync with backend (in case the backend actually deletes it)
      setTimeout(async () => {
        await loadConversations();
      }, 100); // Small delay to allow UI to update first
    } catch (error) {
      console.error('Error deleting conversation:', error);

      // Even if there's an error, still try to remove from local state
      setConversations(prev => prev.filter(conv => conv.id !== convId));

      // Reload conversations to ensure UI is synced with backend
      try {
        await loadConversations();
      } catch (reloadError) {
        console.error('Error reloading conversations:', reloadError);
      }
    }
  };

  const updateConversationTitle = async (convId: string, newTitle: string) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Since there's no direct endpoint to update conversation title in the backend,
      // we'll update our local conversations state to reflect the new title
      setConversations(prev => prev.map(conv =>
        conv.id === convId ? { ...conv, title: newTitle } : conv
      ));
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !conversationId) return;

    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get the auth token
      const token = getToken();
      if (!token) {
        console.error('No access token found');
        // Redirect to login if no token
        router.push('/login');
        return;
      }

      // Call the backend API to process the message
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message_content: inputValue,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Token may have expired');
          // Clear token and redirect to login page
          logout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response to the chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update conversation title if this is the first user message
      if (messages.length === 0 && userMessage.role === 'user' && conversationId) { // First message in the conversation
        // Generate a title based on the user's first message
        let title = inputValue.trim();
        // Limit title length and remove special characters for a cleaner title
        if (title.length > 30) {
          title = title.substring(0, 30) + '...';
        }
        // Capitalize first letter
        title = title.charAt(0).toUpperCase() + title.slice(1);

        // Update the conversation title in the local state
        await updateConversationTitle(conversationId, title);
      }

      // Check if the AI response indicates a task was added and trigger refresh
      const responseText = data.response.toLowerCase();
      if (responseText.includes('added') && (responseText.includes('task') || responseText.includes('added the task'))) {
        if (onTaskAdded) {
          onTaskAdded();
        }
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new Event('task-added'));
      }

      // Ensure conversation ID is persisted in localStorage after successful message exchange
      if (conversationId) {
        const state = {
          conversationId,
          isActive: true,
          timestamp: Date.now()
        };
        localStorage.setItem('activeConversation', JSON.stringify(state));
      }

      // Save the open state to localStorage
      saveChatState(true);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[600px] h-[500px] bg-[#F5F5DC] flex flex-col border-2 border-black rounded-lg shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-black text-[#F5F5DC] p-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot size={20} />
          <span className="font-semibold">TaskFlow AI Assistant</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={toggleHistorySidebar}
            className="text-[#F5F5DC] hover:text-white transition-colors"
            aria-label="Toggle conversation history"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="text-[#F5F5DC] hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation History Sidebar */}
        {showHistorySidebar && (
          <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col">
            <div className="p-3 border-b border-gray-300 font-semibold bg-gray-200">
              Previous Conversations
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? (
                <ul className="py-2">
                  {conversations.map((conv) => (
                    <li key={conv.id} className="flex items-center justify-between p-2 hover:bg-gray-200">
                      <button
                        onClick={() => loadConversationMessages(conv.id)}
                        className="flex-1 text-left truncate text-sm"
                        title={conv.title}
                      >
                        <div className="font-medium truncate text-black">{conv.title}</div>
                        <div className="text-xs text-gray-700 mt-1">
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete "${conv.title}"?`)) {
                            deleteConversation(conv.id);
                          }
                        }}
                        className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                        aria-label="Delete conversation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-800 text-sm">
                  No previous conversations
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 bg-[#F5F5DC]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                <Bot className="mb-2" size={32} />
                <p>Hello! I'm your TaskFlow AI assistant.</p>
                <p className="text-sm mt-1">How can I help with your tasks today?</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={message.id || `message-${index}`}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-black text-[#F5F5DC] rounded-br-none'
                          : 'bg-gray-200 text-black rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'assistant' && <Bot size={16} className="mt-0.5 flex-shrink-0" />}
                        <div
                          className="whitespace-pre-wrap"
                          style={{
                            fontFamily: "'Jameel Noori Nastaleeq', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                          }}
                        >
                          {message.content}
                        </div>
                        {message.role === 'user' && <User size={16} className="mt-0.5 flex-shrink-0" />}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-[#F5F5DC]/70' : 'text-gray-600'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-black rounded-lg rounded-bl-none p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot size={16} />
                        <div>Thinking...</div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-gray-300 p-3 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`bg-black text-[#F5F5DC] rounded-r-lg px-4 py-2 flex items-center justify-center ${
                  (!inputValue.trim() || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;