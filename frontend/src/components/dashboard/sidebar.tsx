'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Home, ListTodo, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Inbox', icon: ListTodo },
  { href: '/dashboard/upcoming', label: 'Upcoming', icon: Home },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <aside className="w-64 bg-black text-[#F5F5DC] min-h-screen hidden md:block border-r border-[rgba(245,245,220,0.1)]">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#F5F5DC]">TaskFlow</h1>
        </div>
        <nav className="mt-8">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              let isActive = false;
              if (item.href === '/dashboard/upcoming') {
                isActive = pathname === '/dashboard/upcoming';
              } else if (item.href === '/dashboard') {
                isActive = pathname === '/dashboard' || pathname === '/' ||
                           (pathname.startsWith('/dashboard') && pathname !== '/dashboard/upcoming');
              } else {
                isActive = pathname === item.href;
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#F5F5DC] text-black border-r-2 border-[#F5F5DC]'
                        : 'text-[#F5F5DC]/70 hover:bg-[#F5F5DC]/10 hover:text-[#F5F5DC]'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}

            <li>
              <button
                onClick={logout}
                className="flex items-center px-6 py-3 text-sm font-medium text-[#F5F5DC]/70 hover:bg-[#F5F5DC]/10 hover:text-[#F5F5DC] mt-8 w-full text-left"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </li>

            {/* Placeholder for user email during hydration */}
            <li className="mt-auto pt-4 pb-6 px-6">
              <div className="flex items-center text-xs text-gray-400 opacity-0">
                <span className="mr-2">👤</span>
                <span className="truncate">placeholder@example.com</span>
              </div>
            </li>
          </ul>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-black text-[#F5F5DC] min-h-screen hidden md:block border-r border-[rgba(245,245,220,0.1)]">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#F5F5DC]">TaskFlow</h1>
      </div>

      <nav className="mt-8">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon;
            let isActive = false;
            if (item.href === '/dashboard/upcoming') {
              isActive = pathname === '/dashboard/upcoming';
            } else if (item.href === '/dashboard') {
              isActive = pathname === '/dashboard' || pathname === '/' ||
                         (pathname.startsWith('/dashboard') && pathname !== '/dashboard/upcoming');
            } else {
              isActive = pathname === item.href;
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F5F5DC] text-black border-r-2 border-[#F5F5DC]'
                      : 'text-[#F5F5DC]/70 hover:bg-[#F5F5DC]/10 hover:text-[#F5F5DC]'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}

          <li>
            <button
              onClick={logout}
              className="flex items-center px-6 py-3 text-sm font-medium text-[#F5F5DC]/70 hover:bg-[#F5F5DC]/10 hover:text-[#F5F5DC] mt-8 w-full text-left"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </li>

          {user && user.email && (
            <li className="mt-auto pt-4 pb-6 px-6" suppressHydrationWarning>
              <div className="flex items-center text-xs text-gray-400">
                <span className="mr-2">👤</span>
                <span className="truncate">{user.email}</span>
              </div>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}