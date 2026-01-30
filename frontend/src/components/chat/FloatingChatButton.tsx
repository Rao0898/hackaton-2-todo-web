'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { useAuth } from '@/context/auth-context';
import { usePathname } from 'next/navigation';

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Initialize from localStorage
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const chatOpenState = localStorage.getItem('isChatOpen');
      if (chatOpenState) {
        try {
          const savedIsOpen = JSON.parse(chatOpenState);
          setIsOpen(savedIsOpen);
        } catch (e) {
          console.error('Error parsing chat open state from localStorage', e);
        }
      }
    }
  }, [isAuthenticated, isLoading]); // Include both auth status and loading state

  // Don't show the chat button on auth pages or if user is not authenticated
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const shouldShowButton = isAuthenticated && !isAuthPage;

  // If loading or user shouldn't see the button, return null
  if (isLoading || !shouldShowButton) {
    return null;
  }

  const toggleChat = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('isChatOpen', JSON.stringify(newState));
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('isChatOpen', JSON.stringify(false));
  };

  // Callback when a task is added via the AI
  const handleTaskAdded = () => {
    // Optionally trigger a refresh of the task list in the parent app
    // This could dispatch an event or call a parent function if provided
    console.log('Task added via AI, triggering refresh...');

    // Dispatch a custom event that other parts of the app can listen for
    window.dispatchEvent(new CustomEvent('taskAddedViaAI'));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="relative">
          <ChatWindow onClose={handleClose} onTaskAdded={handleTaskAdded} />
          <button
            onClick={handleClose}
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-black text-[#F5F5DC] p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#F5F5DC] focus:ring-opacity-50"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default FloatingChatButton;