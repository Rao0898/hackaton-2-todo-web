'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated, login, signup } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home'); // Redirect to home if already logged in
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Ensure name has a default value if empty
      const nameToSend = name.trim() || 'User';
      const success = await signup(email, password, nameToSend);

      if (success) {
        // Redirect to home page after successful signup
        router.push('/home');
      } else {
        setError('Failed to create account');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#F5F5DC]/5 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[#F5F5DC]/5 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F5F5DC]/3 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-[#F5F5DC]/20 p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#F5F5DC]">Create Account</h1>
            <p className="text-[#F5F5DC]/70 mt-2">
              Create a new account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#F5F5DC]/80 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-[#F5F5DC]/20 rounded-lg text-[#F5F5DC] placeholder-[#F5F5DC]/50 focus:outline-none focus:ring-2 focus:ring-[#F5F5DC] focus:border-transparent transition-all duration-300"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#F5F5DC]/80 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-[#F5F5DC]/20 rounded-lg text-[#F5F5DC] placeholder-[#F5F5DC]/50 focus:outline-none focus:ring-2 focus:ring-[#F5F5DC] focus:border-transparent transition-all duration-300"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#F5F5DC]/80 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-[#F5F5DC]/20 rounded-lg text-[#F5F5DC] placeholder-[#F5F5DC]/50 focus:outline-none focus:ring-2 focus:ring-[#F5F5DC] focus:border-transparent transition-all duration-300"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#F5F5DC] text-black py-3 px-4 rounded-full font-bold hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#F5F5DC]/20"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#F5F5DC]/70">
              Already have an account?{' '}
              <button
                onClick={() => {
                  router.push('/login');
                }}
                className="text-[#F5F5DC] hover:text-[#F5F5DC]/80 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-[#F5F5DC]/70 hover:text-[#F5F5DC] text-sm transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}