'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      setShowSuccess(true);
      toast.success('Welcome back!');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Toaster position="bottom-right" />

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-rose/5 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-deep via-surface to-void" />

        <div className="relative z-10 flex flex-col justify-center px-16 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-bright flex items-center justify-center shadow-gold">
                <span className="font-serif font-bold text-2xl text-void">ET</span>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <span className="text-text-tertiary text-sm tracking-widest uppercase">Evolution of Todo</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight leading-tight text-text-primary mb-6">
              Order from <br />
              <span className="text-gradient-gold italic">Chaos.</span>
            </h1>

            <p className="text-xl text-text-secondary font-light leading-relaxed mb-12">
              An elegant workspace for the focused mind. Orchestrate your life with clarity and purpose.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-6 text-sm text-text-tertiary">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:shield-check" className="w-4 h-4 text-gold" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:infinity" className="w-4 h-4 text-rose" />
                <span>Unlimited</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:zap" className="w-4 h-4 text-gold-bright" />
                <span>Fast</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-bright flex items-center justify-center shadow-gold mx-auto mb-4">
              <span className="font-serif font-bold text-2xl text-void">ET</span>
            </div>
            <p className="text-text-tertiary text-sm">Evolution of Todo</p>
          </div>

          {/* Form Card */}
          <div className="glass-card-static rounded-xl p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-medium text-text-primary mb-2">Welcome Back</h2>
              <p className="text-text-tertiary">Sign in to continue your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                    <Icon icon="lucide:mail" className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`input-gold ${error ? 'border-rose/50' : ''}`}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                    <Icon icon="lucide:lock" className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`input-gold has-right-icon ${error ? 'border-rose/50' : ''}`}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <Icon icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'} className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-rose text-sm bg-rose/10 border border-rose/20 rounded-lg px-4 py-3"
                  >
                    <Icon icon="lucide:alert-circle" className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center
                      ${rememberMe
                        ? 'bg-gold border-gold'
                        : 'border-white/20 group-hover:border-gold/50'
                      }`}
                    >
                      {rememberMe && (
                        <Icon icon="lucide:check" className="w-3 h-3 text-void" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-text-secondary">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-gold py-4 rounded-lg font-semibold text-deep flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-5 h-5 border-2 border-deep/30 border-t-deep rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </motion.div>
                  ) : showSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Icon icon="lucide:check-circle" className="w-5 h-5" />
                      <span>Welcome!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span>Sign In</span>
                      <Icon icon="lucide:arrow-right" className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </form>

            {/* Register Link */}
            <p className="text-center mt-8 text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-gold hover:text-gold-bright font-medium transition-colors">
                Create one
              </Link>
            </p>

            {/* Back to Home */}
            <div className="text-center mt-4">
              <Link href="/landing" className="text-sm text-text-tertiary hover:text-gold transition-colors">
                &larr; Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
