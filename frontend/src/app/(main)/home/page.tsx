'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import TypewriterComponent from '@/components/typewriter';
import FloatingBox from '@/components/floating-box';
import { Zap, Shield, Star, Layers, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F5F5DC] mx-auto"></div>
          <p className="mt-4 text-[#F5F5DC]/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect will happen in useEffect
  }

  return (
    <div className="min-h-screen !bg-black text-[#F5F5DC] selection:bg-[#F5F5DC] selection:text-black">

      {/* 1. HERO SECTION: 2 Columns Layout */}
      <section className="min-h-screen flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 pt-20">

        {/* LEFT COLUMN: Static Words + Typewriter Heading + Description */}
        <div className="md:w-1/2 mb-12 md:mb-0">
          <div className="mb-6">
            <div className="text-[#F5F5DC]/50 text-sm font-medium uppercase flex items-center justify-center md:justify-start">
              Organize <span className="mx-2">|</span> Prioritize <span className="mx-2">|</span> Achieve <span className="mx-2">|</span> Succeed
            </div>
          </div>
          <div className="mb-6">
            <TypewriterComponent />
          </div>
          <p className="text-[#F5F5DC]/70 text-lg mt-6 mb-10 max-w-lg leading-relaxed">
            Experience the next generation of task management. Built for those who
            value precision, speed, and a premium workflow.
          </p>

          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#F5F5DC] text-black px-10 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(245,245,220,0.3)] flex items-center group transition-all"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* RIGHT COLUMN: Infinite Floating Elements */}
        <div className="md:w-1/2 relative flex flex-col space-y-6 items-end">
          {[
            { title: "Priority Tasks", desc: "Manage what matters.", icon: Zap, delay: 0 },
            { title: "Team Sync", desc: "Collaborate in real-time.", icon: Shield, delay: 0.5 },
            { title: "Smart Insights", desc: "Track your progress.", icon: Star, delay: 1 }
          ].map((item, i) => (
            <FloatingBox
              key={i}
              title={item.title}
              description={item.desc}
              icon={<item.icon />}
              delay={item.delay}
            />
          ))}
        </div>
      </section>

      {/* 2. FEATURES SECTION: Glassmorphism Grid */}
      <section className="py-24 px-6 border-t border-[#F5F5DC]/10 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Premium Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Lightning Fast", icon: Zap },
              { title: "Secure Vault", icon: Shield },
              { title: "Pro Design", icon: Star },
              { title: "Modular", icon: Layers }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-[#F5F5DC]/10 hover:border-[#F5F5DC]/30 transition-all group"
              >
                <div className="w-12 h-12 bg-[#F5F5DC] rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_15px_rgba(245,245,220,0.5)] transition-all">
                  <feature.icon className="text-black h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-[#F5F5DC]/50">High-performance tools for your daily professional needs.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}