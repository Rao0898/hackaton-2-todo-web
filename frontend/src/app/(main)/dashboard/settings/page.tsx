'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    username: 'user123',
    email: 'user@example.com',
    notifications: true,
    theme: 'dark',
    timezone: 'UTC-5',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings saved:', formData);
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-black text-[#F5F5DC] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#F5F5DC]">Settings</h1>
          <p className="text-[#F5F5DC]/70">Manage your account and preferences</p>
        </header>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-md rounded-xl border border-[#F5F5DC]/10 p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h2 className="text-xl font-bold mb-4 text-[#F5F5DC]">Account Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[#F5F5DC]/80 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-[#F5F5DC]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F5F5DC] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[#F5F5DC]/80 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-[#F5F5DC]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F5F5DC] disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 text-[#F5F5DC]">Preferences</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[#F5F5DC]/80 mb-2">Theme</label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-[#F5F5DC]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F5F5DC]"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label className="block text-[#F5F5DC]/80 mb-2">Timezone</label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-[#F5F5DC]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F5F5DC]"
                >
                  <option value="UTC-12">GMT-12:00</option>
                  <option value="UTC-5">GMT-05:00 (EST)</option>
                  <option value="UTC+0">GMT+00:00 (UTC)</option>
                  <option value="UTC+1">GMT+01:00 (CET)</option>
                  <option value="UTC+8">GMT+08:00 (CST)</option>
                  <option value="UTC+9">GMT+09:00 (JST)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 text-[#F5F5DC]">Notifications</h2>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="notifications"
                checked={formData.notifications}
                onChange={handleChange}
                className="w-5 h-5 text-[#F5F5DC] bg-white/10 border-[#F5F5DC]/20 rounded focus:ring-[#F5F5DC] focus:ring-2"
              />
              <label className="ml-2 text-[#F5F5DC]/80">Enable email notifications</label>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-[#F5F5DC] text-black font-semibold rounded-lg hover:bg-[#F5F5DC]/90 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}