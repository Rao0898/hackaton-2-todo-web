'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { taskAPI } from '@/lib/api';

interface TodoFormProps {
  onAddTodo?: (title: string, priority: 'low' | 'medium' | 'high') => void; // Optional for backward compatibility
  onTaskCreated?: () => void; // Function to call after task is successfully created
}

const TodoForm = ({ onAddTodo, onTaskCreated }: TodoFormProps = {}) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tags, setTags] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user, getToken } = useAuth(); // Get user and token from auth context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim() && user) {
      setLoading(true);

      try {
        const token = getToken();
        if (!token) {
          console.error('No access token found');
          // Redirect to login if no token
          router.push('/login');
          return;
        }

        // Prepare the task data to send to the backend
        // Note: The backend automatically assigns user_id based on the authenticated user from the token
        const taskData: any = {
          title: title.trim(),
          priority: priority.toLowerCase(), // Ensure priority is lowercase to match PriorityEnum
          // Do not include user_id in the request body - backend extracts it from the token
        };

        // Add tags if provided - ensure it's always sent as an array
        if (tags.trim()) {
          // Split tags by comma and trim whitespace
          const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
          // Always send tags as an array to match backend schema
          taskData.tags = Array.isArray(tagArray) ? tagArray : [];
        } else {
          // Send empty array if no tags provided to match backend schema
          taskData.tags = [];
        }

        // Add due date if provided
        if (dueDate) {
          // The datetime-local input gives us a string in YYYY-MM-DDTHH:mm format
          // We need to treat this as the user's local time and convert appropriately
          // Create a Date object from the local datetime string
          const localDate = new Date(dueDate);
          // Convert to ISO string (which is always in UTC/Zulu time)
          // This preserves the user's intention for the local time
          const isoDate = localDate.toISOString();
          taskData.due_date = isoDate;
        } else {
          // Send null if no due date to match backend schema
          taskData.due_date = null;
        }

        console.log('Creating task with data:', taskData);

        // Use the centralized task API
        const newTask = await taskAPI.create(taskData);
        console.log('Task created successfully:', newTask);

        // Call the parent callback if provided (for backward compatibility)
        if (onAddTodo) {
          onAddTodo(title.trim(), priority);
        }

        // Reset form
        setTitle('');

        // Call the onTaskCreated callback if provided
        if (onTaskCreated) {
          onTaskCreated();
        }
      } catch (error: any) {
        console.error('Error creating task:', error);

        // Handle specific error cases
        if (error.message && error.message.includes('401')) {
          console.error('Unauthorized: Redirecting to login');
          localStorage.removeItem('access_token');
          router.push('/login');
        } else if (error.message && error.message.includes('Failed to fetch')) {
          console.error('Network error: Please check your connection and try again');
        } else {
          console.error('An error occurred while creating the task:', error.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task..."
            disabled={loading}
            className="w-full px-4 py-3 bg-white/10 border border-cream/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5F5DC] disabled:opacity-50"
          />
        </div>

        <div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            disabled={loading}
            className="w-full px-4 py-3 bg-white/10 border border-cream/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F5F5DC] disabled:opacity-50"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        <div>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 bg-white/10 border border-cream/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F5F5DC] disabled:opacity-50"
          />
        </div>

        <div className="md:col-span-2">
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            disabled={loading}
            className="w-full px-4 py-3 bg-white/10 border border-cream/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5F5DC] disabled:opacity-50"
          />
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#F5F5DC] text-black font-semibold rounded-lg hover:bg-[#F5F5DC]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </span>
          ) : (
            'Add Task'
          )}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;