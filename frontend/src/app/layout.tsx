import { AuthProvider } from '@/context/auth-context';
import "./globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClientProviders } from "./client-providers";
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import FloatingChatButton from '@/components/chat/FloatingChatButton';

// Font setup with fixes for terminal connection errors
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap", // Terminal error fix: loads font only when available
  preload: false,  // Terminal error fix: stops trying to pre-download from Google
});

export const metadata: Metadata = {
  title: "Advanced Todo App",
  description: "A sophisticated task management application with a premium aesthetic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={cn(
          // Background and font settings - removed !bg-black to allow components to manage visibility
          "min-h-screen bg-black text-[#F5F5DC] font-sans antialiased selection:bg-[#F5F5DC] selection:text-black",
          fontSans.variable
        )}
      >
        <AuthProvider>
          <ClientProviders>
            {children}
            <FloatingChatButton />
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}