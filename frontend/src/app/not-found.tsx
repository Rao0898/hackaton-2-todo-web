import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    // Background pure black aur text cream set kar diya hai
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-[#F5F5DC] p-4 selection:bg-[#F5F5DC] selection:text-black">
      
      {/* 404 Glow Effect */}
      <h1 className="text-9xl font-bold tracking-tighter opacity-20 absolute select-none">
        404
      </h1>

      <div className="relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Lost in Space?
        </h2>
        <p className="text-[#F5F5DC]/60 mb-8 max-w-md mx-auto text-lg">
          The page you are looking for doesn't exist or has been moved to a 
          more premium location.
        </p>

        <Link href="/">
          <Button 
            className="bg-[#F5F5DC] text-black hover:bg-[#F5F5DC]/90 rounded-full px-8 py-6 font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,245,220,0.2)]"
          >
            <Home className="mr-2 h-5 w-5" />
            Return to Masterpiece
          </Button>
        </Link>
      </div>

      {/* Subtle border line at bottom */}
      <div className="absolute bottom-10 w-full max-w-xs h-[1px] bg-gradient-to-r from-transparent via-[#F5F5DC]/20 to-transparent" />
    </div>
  );
}