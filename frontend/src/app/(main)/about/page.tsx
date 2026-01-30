"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background flex items-center justify-center" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* About Content */}
      <main className="container mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-amber-400">TaskFlow</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your ultimate solution for task management and productivity
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto glass-card rounded-2xl p-8 md:p-12"
        >
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-left text-foreground">Our Mission</h2>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              At TaskFlow, we believe that productivity should be intuitive, efficient, and enjoyable. Our mission is to
              simplify the complex world of task management by providing a platform that adapts to your workflow rather
              than forcing you to adapt to it.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-10 text-left text-foreground">Advanced Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="glass-card p-6 rounded-xl border border-border group hover:border-foreground/30 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-3 text-amber-400 group-hover:text-foreground transition-colors">Smart Prioritization</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Our intelligent algorithm helps you focus on the most important tasks at the right time,
                  maximizing your productivity and minimizing stress.
                </p>
              </div>
              <div className="glass-card p-6 rounded-xl border border-border group hover:border-foreground/30 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-3 text-amber-400 group-hover:text-foreground transition-colors">Collaborative Workflows</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Seamlessly collaborate with team members by sharing tasks, setting dependencies,
                  and tracking progress in real-time.
                </p>
              </div>
              <div className="glass-card p-6 rounded-xl border border-border group hover:border-foreground/30 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-3 text-amber-400 group-hover:text-foreground transition-colors">Recurring Tasks</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Automate repetitive tasks with our flexible recurrence patterns.
                  Never forget routine activities again.
                </p>
              </div>
              <div className="glass-card p-6 rounded-xl border border-border group hover:border-foreground/30 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-3 text-amber-400 group-hover:text-foreground transition-colors">Advanced Analytics</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Gain insights into your productivity patterns with detailed analytics and reporting tools.
                </p>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-10 text-left text-foreground">Why Choose TaskFlow?</h2>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              TaskFlow isn't just another todo list. It's a comprehensive productivity ecosystem designed for individuals
              and teams who demand excellence. With our cutting-edge technology and user-centric approach,
              we've created a platform that grows with you and adapts to your evolving needs.
            </p>

            <p className="text-muted-foreground text-lg leading-relaxed">
              Join thousands of satisfied users who have transformed their productivity and achieved their goals
              with TaskFlow. Experience the difference that thoughtful design and powerful features can make.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center mt-12"
        >
          <Link href="/signup">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black text-lg px-8 py-4">
              Start Your Journey
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}