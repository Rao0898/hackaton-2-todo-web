'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/task';

export default function Topbar() {
  const { getToken, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Task[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Track previous notifications to detect new ones
  const [previousNotificationIds, setPreviousNotificationIds] = useState<Set<string>>(new Set());

  // Fetch notifications every 60 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.error('No access token found');
          // Redirect to login if no token
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:8000/api/tasks/notifications/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Ensure data is an array before mapping to prevent "data.map is not a function" error
          const dataArray = Array.isArray(data) ? data : [];

          // Find new notifications that weren't present before
          const currentNotificationIds = new Set(dataArray.map((task: any) => task.id));
          const newNotifications: Task[] = dataArray.filter((task: Task) => !previousNotificationIds.has(task.id));

          setNotifications(dataArray);

          // Update previous notification IDs
          setPreviousNotificationIds(currentNotificationIds);

          // Show browser notifications for new tasks due soon
          if (newNotifications.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
            newNotifications.forEach((task: Task) => {
              const dueTime = task.due_date ? new Date(task.due_date).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : '';
              new Notification('Task Due Soon!', {
                body: `${task.title} is due at ${dueTime}`,
                icon: '/favicon.ico', // You can customize this with your app's icon
              });
            });
          }
        } else if (response.status === 401) {
          console.error('Unauthorized: Token may have expired');
          // Clear token and redirect to login page
          logout();
        } else {
          console.error('Failed to fetch notifications:', response.status);
          // Set empty array in case of error to clear previous notifications
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // Fetch immediately and then every 60 seconds
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60 * 1000); // 60 seconds

    // Cleanup function to clear interval on unmount
    return () => clearInterval(interval);
  }, [getToken, logout, router]); // Added logout and router to dependency array

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Format date for display using local timezone
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toLocaleDateString() === now.toLocaleDateString()) {
      // Same day: show time only
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      // Different day: show date and time
      return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  return (
    <header className="bg-black text-[#F5F5DC] p-4 flex items-center justify-between border-b border-[#F5F5DC]/10">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden mr-4 text-[#F5F5DC]">
          <Menu className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-semibold text-[#F5F5DC]">Dashboard</h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F5F5DC]/50" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-[#F5F5DC]/5 text-[#F5F5DC] pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5F5DC] border border-[#F5F5DC]/20"
          />
        </div>

        {/* Bell Icon with Notification Indicator */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#F5F5DC] relative"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Bell className="h-6 w-6" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                {notifications.length}
              </span>
            )}
          </Button>

          {/* Dropdown for Notifications */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-black border border-[#F5F5DC]/20 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-[#F5F5DC]/10">
                <h3 className="font-semibold text-[#F5F5DC]">Notifications</h3>
                <p className="text-xs text-[#F5F5DC]/60">
                  {notifications.length} upcoming task{notifications.length !== 1 ? 's' : ''}
                </p>
              </div>

              {notifications.length > 0 ? (
                <div className="divide-y divide-[#F5F5DC]/10">
                  {notifications.map((task) => (
                    <div key={task.id} className="p-4 hover:bg-[#F5F5DC]/5 cursor-pointer">
                      <div className="font-medium text-[#F5F5DC] truncate">{task.title}</div>
                      <div className="text-xs text-[#F5F5DC]/60 mt-1">
                        Due: {task.due_date ? formatDate(task.due_date) : 'No due date'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-[#F5F5DC]/60">
                  <p>No upcoming tasks</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-[#F5F5DC] flex items-center justify-center">
          <span className="text-sm font-medium text-black">U</span>
        </div>
      </div>
    </header>
  );
}