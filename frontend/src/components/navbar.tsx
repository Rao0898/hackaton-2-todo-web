'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const Navbar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Don't hide navbar anymore - show on all routes
  // if (pathname.startsWith('/dashboard')) {
  //   return null;
  // }

  // Define navigation links
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className="bg-[#F5F5DC] text-black px-8 py-4 flex justify-between items-center border-b border-black/10 shadow-sm">
      {/* Left Side - Logo */}
      <div className="font-bold tracking-tighter text-xl">
        TASKFLOW
      </div>

      {/* Center - Navigation Links */}
      <div className="hidden md:flex space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`font-medium transition-opacity hover:opacity-70 ${
              pathname === link.href ? 'underline underline-offset-4' : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right Side - Logout Button */}
      <div>
        <button
          onClick={logout}
          className="border border-black text-black px-4 py-2 rounded font-medium hover:opacity-70 transition-opacity"
        >
          <div className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </div>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;