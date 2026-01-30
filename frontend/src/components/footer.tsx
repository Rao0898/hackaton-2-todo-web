'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const pathname = usePathname();

  // Don't show footer on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <footer className="bg-[#F5F5DC] border-t border-black/10 text-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-black">TaskFlow</h3>
            <p className="text-sm mt-1 text-black/70">Your productivity companion</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            <div>
              <h4 className="text-sm font-semibold text-black mb-2">Product</h4>
              <ul className="text-sm space-y-1">
                <li><a href="/features" className="text-black/70 hover:text-black transition-colors">Features</a></li>
                <li><a href="/pricing" className="text-black/70 hover:text-black transition-colors">Pricing</a></li>
                <li><a href="/integrations" className="text-black/70 hover:text-black transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-black mb-2">Company</h4>
              <ul className="text-sm space-y-1">
                <li><a href="/about" className="text-black/70 hover:text-black transition-colors">About</a></li>
                <li><a href="/contact" className="text-black/70 hover:text-black transition-colors">Contact</a></li>
                <li><a href="/blog" className="text-black/70 hover:text-black transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-black mb-2">Legal</h4>
              <ul className="text-sm space-y-1">
                <li><a href="/privacy" className="text-black/70 hover:text-black transition-colors">Privacy</a></li>
                <li><a href="/terms" className="text-black/70 hover:text-black transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-black">© {currentYear} TaskFlow. All rights reserved.</p>
            <p className="text-xs mt-1 text-black/70">Designed with ❤️ for productivity</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-black/10 text-center">
          <p className="text-xs text-black/70">Made with Next.js, Tailwind CSS, and lots of ☕</p>
        </div>
      </div>
    </footer>
  );
}