'use client';

import { ReactNode, useEffect, useRef } from 'react';

interface FloatingBoxProps {
  title: string;
  description: string;
  icon: ReactNode;
  delay?: number;
}

const FloatingBox = ({ title, description, icon, delay = 0 }: FloatingBoxProps) => {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const bounceAnimation = () => {
      // Apply bounce animation with random variation
      const duration = 3000 + Math.random() * 2000; // 3-5 seconds
      const amplitude = 10 + Math.random() * 10; // 10-20px

      box.animate(
        [
          { transform: `translateY(0px)` },
          { transform: `translateY(-${amplitude}px)` },
          { transform: `translateY(0px)` },
          { transform: `translateY(${amplitude}px)` },
          { transform: `translateY(0px)` },
        ],
        {
          duration,
          iterations: Infinity,
          easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
          delay: delay * 1000,
        }
      );
    };

    // Start animation after a short delay to ensure DOM is ready
    const initTimer = setTimeout(bounceAnimation, 100 + delay * 1000);

    return () => {
      clearTimeout(initTimer);
    };
  }, [delay]);

  return (
    <div
      ref={boxRef}
      className="w-full p-6 bg-[#F5F5DC]/5 backdrop-blur-xl border border-[#F5F5DC]/15 rounded-2xl flex items-start gap-4 transition-all hover:border-[#F5F5DC]/30 hover:bg-[#F5F5DC]/10 group"
    >
      <div className="w-12 h-12 bg-[#F5F5DC]/10 rounded-xl flex items-center justify-center text-[#F5F5DC] shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-[#F5F5DC] mb-1">{title}</h3>
        <p className="text-[#F5F5DC]/70 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default FloatingBox;