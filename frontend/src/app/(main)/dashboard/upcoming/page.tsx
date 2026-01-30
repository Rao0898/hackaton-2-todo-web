'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import TodoList from '@/components/todo-list';

export default function UpcomingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Check authentication on initial load
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show nothing while checking auth status
  if (authLoading) {
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

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-[#F5F5DC] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#F5F5DC]">Upcoming</h1>

        <TodoList />
      </div>
    </div>
  );
}