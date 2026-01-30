'use client';

// Simple debug page to test if the basic structure works
export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 text-black p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Debug Dashboard</h1>
      <p className="text-black">This is a simple debug page to test if rendering works.</p>
      <p className="text-black">If you see this, then the issue is likely with authentication or API calls.</p>
    </div>
  );
}