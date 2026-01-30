'use client';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      // defaultTheme ko "dark" kiya hai taake hamesha Black background rahe
      defaultTheme="dark"
      enableSystem={false} // System setting ko ignore karega taake premium look maintain rahe
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-black text-[#F5F5DC]">
        {children}
      </div>
      {/* Toaster (Notifications) ka color bhi hamare theme ke hisaab se hoga */}
      <Toaster />
    </ThemeProvider>
  );
}