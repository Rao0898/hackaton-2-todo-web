'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Mock data for projects
const mockProjects = [
  { id: 1, name: 'Website Redesign', tasks: 12, completed: 8, status: 'Active', progress: 67 },
  { id: 2, name: 'Mobile App', tasks: 24, completed: 15, status: 'Active', progress: 63 },
  { id: 3, name: 'Marketing Campaign', tasks: 8, completed: 3, status: 'Pending', progress: 38 },
  { id: 4, name: 'Database Migration', tasks: 15, completed: 10, status: 'In Progress', progress: 67 },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(mockProjects);

  return (
    <div className="min-h-screen bg-black text-[#F5F5DC] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#F5F5DC]">Projects</h1>
          <p className="text-[#F5F5DC]/70">Manage and track your projects</p>
        </header>

        <div className="mb-6">
          <button className="px-6 py-3 bg-[#F5F5DC] text-black font-semibold rounded-lg hover:bg-[#F5F5DC]/90 transition-colors">
            + New Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              className="bg-white/5 backdrop-blur-md rounded-xl border border-[#F5F5DC]/10 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(245, 245, 220, 0.1)" }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[#F5F5DC]">{project.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  project.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                  project.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {project.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-[#F5F5DC]/10 rounded-full h-2">
                  <div
                    className="bg-[#F5F5DC] h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-sm text-[#F5F5DC]/70">
                <span>{project.completed}/{project.tasks} tasks</span>
                <span>{project.tasks - project.completed} remaining</span>
              </div>

              <div className="mt-4 pt-4 border-t border-[#F5F5DC]/10">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="text-[#F5F5DC] hover:text-[#F5F5DC]/80 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}