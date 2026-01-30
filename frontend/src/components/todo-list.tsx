'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { taskAPI } from '@/lib/api';
import TodoItem from './todo-item';

interface TodoItemType {
  id: string; // UUID from backend
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  tags?: string[];
  completed_at?: string;
  next_occurrence?: string;
}

interface TodoListProps {
  sortOption?: 'default' | 'title' | 'due_date';
}

// Define a simpler approach - just export the fetchTasks function through a callback
const TodoList: React.FC<TodoListProps> = ({ sortOption: propSortOption = 'default' }) => {
  const router = useRouter();
  const [todos, setTodos] = useState<TodoItemType[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<TodoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localSortOption, setLocalSortOption] = useState<'default' | 'title' | 'due_date'>('default');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { user, getToken, isAuthenticated, isLoading, logout } = useAuth();

  console.log('TodoList - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'getToken available:', !!getToken);

  // Use prop sort option if provided, otherwise use local state
  const effectiveSortOption = propSortOption !== 'default' ? propSortOption : localSortOption;

  // Search and filter tasks
  useEffect(() => {
    let filtered = [...todos];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(term) ||
        (todo.tags && todo.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Apply sorting
    if (effectiveSortOption === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (effectiveSortOption === 'due_date') {
      filtered.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;

        // Compare dates - convert to Date objects for comparison
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);

        // Check if dates are valid
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;

        // Sort by nearest date first (ascending order)
        return dateA.getTime() - dateB.getTime();
      });
    }

    setFilteredTodos(filtered);
  }, [todos, searchTerm, effectiveSortOption]);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      // Only fetch if user is authenticated and not loading
      if (!isAuthenticated) {
        console.log('Skipping fetch - user not authenticated:', { isAuthenticated });
        return;
      }

      if (isLoading) {
        console.log('Skipping fetch - auth still loading:', { isLoading });
        return;
      }

      const token = getToken();
      if (!token) {
        console.error('No access token found');
        // Redirect to login page if token is missing
        router.push('/login');
        return;
      }

      console.log('Fetching tasks with token:', token.substring(0, 10) + '...');

      // Set loading to true only after all checks pass
      setLoading(true);

      // Use the centralized task API
      const data = await taskAPI.getAll();
      console.log('Fetched tasks:', data);
      setTodos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);

      // Handle specific error cases
      if (err.message && err.message.includes('401')) {
        console.error('Unauthorized: Calling logout to clear session');
        // ERROR HANDLING: Call logout to clear session and redirect
        logout();
      } else if (err.message && err.message.includes('Failed to fetch')) {
        console.error('Network error: Please check your connection and backend server');
        setError('Network error: Could not connect to server. Please check if the backend is running.');
      } else {
        setError(`Failed to load tasks: ${err.message || 'Unknown error'}`);
      }
    } finally {
      // Always set loading to false in the finally block to ensure it's reset
      setLoading(false);
    }
  };

  // Memoized callback to refetch tasks after creation
  const refreshTasks = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Initial fetch and refetch when auth state changes
  useEffect(() => {
    // Only fetch when authentication is confirmed and user is authenticated
    if (!isLoading && isAuthenticated) {
      fetchTasks();
    } else if (!isAuthenticated && !isLoading) {
      // If not authenticated and auth loading is complete, set loading to false and clear todos
      setLoading(false);
      setTodos([]);
    } else if (isLoading) {
      // If auth is still loading, don't change the loading state yet
      // Let the component maintain its current loading state until auth state is resolved
    }
  }, [isLoading, isAuthenticated]);

  // Listen for task-added event to refresh tasks
  useEffect(() => {
    const handleTaskAdded = () => {
      fetchTasks();
    };

    window.addEventListener('task-added', handleTaskAdded);

    // Clean up the event listener
    return () => {
      window.removeEventListener('task-added', handleTaskAdded);
    };
  }, [fetchTasks]);

  // Toggle task completion
  const toggleTodo = async (id: string | number) => {
    try {
      const updatedTask = await taskAPI.toggleComplete(id.toString());
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id.toString() ? { ...todo, completed: updatedTask.completed, completed_at: updatedTask.completed_at } : todo
        )
      );
    } catch (err: any) {
      console.error('Error toggling task:', err);

      // Handle specific error cases
      if (err.message && err.message.includes('401')) {
        console.error('Unauthorized: Calling logout to clear session');
        logout();
      } else if (err.message && err.message.includes('Failed to fetch')) {
        console.error('Network error: Please check your connection and backend server');
      } else {
        console.error('Failed to toggle task:', err.message || 'Unknown error');
      }
    }
  };

  // Delete task
  const deleteTodo = async (id: string | number) => {
    try {
      await taskAPI.delete(id.toString());
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id.toString()));
    } catch (err: any) {
      console.error('Error deleting task:', err);

      // Handle specific error cases
      if (err.message && err.message.includes('401')) {
        console.error('Unauthorized: Calling logout to clear session');
        logout();
      } else if (err.message && err.message.includes('Failed to fetch')) {
        console.error('Network error: Please check your connection and backend server');
      } else {
        console.error('Failed to delete task:', err.message || 'Unknown error');
      }
    }
  };

  // Update task
  const updateTodo = async (id: string | number, title: string) => {
    try {
      const updatedTask = await taskAPI.update(id.toString(), { title });
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id.toString() ? { ...todo, title: updatedTask.title } : todo
        )
      );
    } catch (err: any) {
      console.error('Error updating task:', err);

      // Handle specific error cases
      if (err.message && err.message.includes('401')) {
        console.error('Unauthorized: Calling logout to clear session');
        logout();
      } else if (err.message && err.message.includes('Failed to fetch')) {
        console.error('Network error: Please check your connection and backend server');
      } else {
        console.error('Failed to update task:', err.message || 'Unknown error');
      }
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h2 className="text-xl font-bold text-[#F5F5DC]">My Tasks</h2>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1 bg-white/10 border border-[#F5F5DC]/20 rounded text-[#F5F5DC] text-sm focus:outline-none focus:ring-1 focus:ring-[#F5F5DC] pl-3 pr-8"
              />
            </div>
            <select
              value={effectiveSortOption}
              onChange={(e) => setLocalSortOption(e.target.value as 'default' | 'title' | 'due_date')}
              className="bg-white/10 border border-[#F5F5DC]/20 rounded px-3 py-1 text-[#F5F5DC] text-sm focus:outline-none focus:ring-1 focus:ring-[#F5F5DC] flex-shrink-0 mt-2 sm:mt-0"
            >
              <option value="default">Default</option>
              <option value="title">Sort by Title</option>
              <option value="due_date">Sort by Due Date</option>
            </select>
            <div className="text-[#F5F5DC]/70">
              Loading...
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-lg border border-[#F5F5DC]/10 mb-3">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-4 rounded bg-[#F5F5DC]/20"></div>
                <div className="h-4 bg-[#F5F5DC]/20 rounded w-3/4"></div>
              </div>
              <div className="h-6 w-16 bg-[#F5F5DC]/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h2 className="text-xl font-bold text-[#F5F5DC]">My Tasks</h2>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1 bg-white/10 border border-[#F5F5DC]/20 rounded text-[#F5F5DC] text-sm focus:outline-none focus:ring-1 focus:ring-[#F5F5DC] pl-3 pr-8"
            />
          </div>
          <select
            value={effectiveSortOption}
            onChange={(e) => setLocalSortOption(e.target.value as 'default' | 'title' | 'due_date')}
            className="bg-white/10 border border-[#F5F5DC]/20 rounded px-3 py-1 text-[#F5F5DC] text-sm focus:outline-none focus:ring-1 focus:ring-[#F5F5DC] flex-shrink-0 mt-2 sm:mt-0"
          >
            <option value="default">Default</option>
            <option value="title">Sort by Title</option>
            <option value="due_date">Sort by Due Date</option>
          </select>
          <div className="text-[#F5F5DC]/70 text-sm whitespace-nowrap">
            {filteredTodos.length} of {todos.length} tasks
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTodos.map((todo) => {
          // Validate todo object before rendering
          if (!todo || typeof todo !== 'object') {
            return null;
          }

          return (
            <TodoItem
              key={todo.id || Math.random().toString()}
              todo={{
                id: todo.id,
                title: todo.title || 'Untitled Task',
                completed: Boolean(todo.completed),
                priority: ['low', 'medium', 'high'].includes(todo.priority) ? todo.priority : 'medium',
                tags: todo.tags,
                due_date: todo.due_date
              }}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
              onUpdate={(id, title) => updateTodo(id, title)}
            />
          );
        }).filter(Boolean)} {/* Remove any null values */}
      </div>

      {filteredTodos.length === 0 && !loading && searchTerm !== '' && (
        <div className="text-center py-8 text-[#F5F5DC]/50">
          No tasks found matching "{searchTerm}". Try a different search term.
        </div>
      )}

      {filteredTodos.length === 0 && !loading && searchTerm === '' && todos.length === 0 && (
        <div className="text-center py-8 text-[#F5F5DC]/50">
          No tasks yet. Add your first task above!
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default TodoList;