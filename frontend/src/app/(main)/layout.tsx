'use client';

import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // Don't show navbar and footer on auth pages (though they won't be here anyway due to route groups)
  const hideNavigation = pathname.startsWith('/login') || pathname.startsWith('/signup');

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {!hideNavigation && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!hideNavigation && <Footer />}
    </div>
  );
}