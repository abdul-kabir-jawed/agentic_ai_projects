'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import NivioLogo from '@/components/NivioLogo';
import { AuthRoute } from '@/components/AuthRoute';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await register(formData.email, formData.username, formData.password, '');
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <AuthRoute>
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Obsidian & Gold Background Animation */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/5 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-80 h-80 bg-yellow-600/3 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, delay: 1 }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <NivioLogo size="lg" animated={true} />
          </div>
          <h1 className="text-4xl font-light text-amber-50 mb-2" style={{ fontFamily: 'Cormorant Garamond' }}>Create Account</h1>
          <p className="text-gray-400">Join Nivio and start organizing</p>
        </div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="backdrop-blur-xl bg-gradient-to-br from-slate-900/40 to-slate-800/30 border border-white/5 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-amber-100 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-white/3 border border-white/8 text-amber-50 placeholder:text-gray-500 focus:outline-none focus:border-amber-600/60 focus:ring-1 focus:ring-amber-500/20 transition-all"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-amber-100 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your_username"
                className="w-full px-4 py-3 rounded-lg bg-white/3 border border-white/8 text-amber-50 placeholder:text-gray-500 focus:outline-none focus:border-amber-600/60 focus:ring-1 focus:ring-amber-500/20 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-amber-100 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-white/3 border border-white/8 text-amber-50 placeholder:text-gray-500 focus:outline-none focus:border-amber-600/60 focus:ring-1 focus:ring-amber-500/20 transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-2">At least 6 characters</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/40 disabled:opacity-50 transition-all mt-6"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/80 text-slate-400">already registered?</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-slate-400 text-sm">
            <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
              Sign in instead
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Protected by industry-standard encryption
        </p>
      </motion.div>
    </div>
    </AuthRoute>
  );
}
