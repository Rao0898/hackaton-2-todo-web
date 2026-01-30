'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import TodoList from '@/components/todo-list';
import TodoForm from '@/components/todo-form';

export default function TasksPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<'default' | 'title' | 'due_date'>('default');

  // Check authentication on initial load
  useEffect(() => {
    // Set loading to false once auth status is determined
    if (!authLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.replace('/login');
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-[#F5F5DC] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-[#F5F5DC]/20 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-[#F5F5DC]/10 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-[#F5F5DC]/10 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State to manage refetching tasks
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger refresh of the TodoList
  const handleTaskCreated = () => {
    setRefreshTrigger(prev => prev + 1); // Increment to trigger a refresh
  };

  return (
    <div className="min-h-screen bg-black text-[#F5F5DC] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#F5F5DC]">Inbox</h1>

        {/* Top Section: Single TodoForm */}
        <div className="mb-8">
          <TodoForm onTaskCreated={handleTaskCreated} />
        </div>

        {/* Middle Section: Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setSortOption('title')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              sortOption === 'title'
                ? 'bg-[#F5F5DC] text-black'
                : 'bg-white/10 text-[#F5F5DC] hover:bg-[#F5F5DC]/20'
            }`}
          >
            Sort by Title
          </button>
          <button
            onClick={() => setSortOption('due_date')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              sortOption === 'due_date'
                ? 'bg-[#F5F5DC] text-black'
                : 'bg-white/10 text-[#F5F5DC] hover:bg-[#F5F5DC]/20'
            }`}
          >
            Sort by Date
          </button>
          <button
            onClick={() => setSortOption('default')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              sortOption === 'default'
                ? 'bg-[#F5F5DC] text-black'
                : 'bg-white/10 text-[#F5F5DC] hover:bg-[#F5F5DC]/20'
            }`}
          >
            Default
          </button>
        </div>

        {/* Bottom Section: TodoList */}
        <TodoList sortOption={sortOption} key={refreshTrigger} />
      </div>
    </div>
  );
}