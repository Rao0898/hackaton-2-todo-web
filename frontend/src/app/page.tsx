"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page on initial visit
    router.push('/login');
  }, [router]);

  // Render nothing while redirecting
  return null;
}