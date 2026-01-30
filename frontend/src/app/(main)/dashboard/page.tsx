'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import TodoList from '@/components/todo-list';
import TodoForm from '@/components/todo-form';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  // State to manage refetching tasks - moved to top to ensure hook order consistency
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  console.log('DashboardPage - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated);

  // Function to trigger refresh of the TodoList
  const handleTaskCreated = () => {
    setRefreshTrigger(prev => prev + 1); // Increment to trigger a refresh
  };

  // Check authentication on initial load
  useEffect(() => {
    // FIX: Only redirect if isLoading is false AND isAuthenticated is false
    if (!authLoading && !isAuthenticated) {
      console.log('Redirecting to login');
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state with safety timeout
  if (authLoading) {
    console.log('Showing loading state');
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-[#F5F5DC]/20 rounded w-1/4 mb-6"></div>
        <div className="h-12 bg-[#F5F5DC]/10 rounded mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-[#F5F5DC]/10 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // FIX: Only redirect if isLoading is false AND user is not authenticated
  if (!authLoading && !isAuthenticated) {
    console.log('Not authenticated and loading complete, redirecting...');
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Only render the dashboard if authenticated
  console.log('Rendering dashboard content');
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#F5F5DC]">Inbox</h1>

      <TodoForm onTaskCreated={handleTaskCreated} />

      <TodoList key={refreshTrigger} />
    </>
  );
}