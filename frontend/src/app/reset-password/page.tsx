'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  // Get token from URL
  const token = searchParams.get('token');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam === 'INVALID_TOKEN') {
      setInvalidToken(true);
    } else if (!token) {
      setInvalidToken(true);
    }
  }, [token, errorParam]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      toast.success('Password reset successful!');
      setTimeout(() => router.push('/login?passwordReset=true'), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (invalidToken) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose to-red-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose/30">
            <Icon icon="lucide:x-circle" className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-serif font-medium text-text-primary mb-2">Invalid or Expired Link</h2>
        <p className="text-text-tertiary mb-8">
          This password reset link is invalid or has expired. Please request a new one.
        </p>

        <div className="space-y-4">
          <Link
            href="/forgot-password"
            className="block w-full btn-gold py-4 rounded-lg font-semibold text-deep text-center"
          >
            Request New Link
          </Link>

          <Link
            href="/login"
            className="block w-full py-4 rounded-lg font-semibold text-text-secondary border border-white/10 hover:border-gold/30 transition-colors text-center"
          >
            Back to Login
          </Link>
        </div>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <Icon icon="lucide:check-circle" className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-serif font-medium text-text-primary mb-2">Password Reset!</h2>
        <p className="text-text-tertiary mb-8">Your password has been successfully reset. Redirecting to login...</p>

        <Link
          href="/login"
          className="inline-block w-full btn-gold py-4 rounded-lg font-semibold text-deep text-center"
        >
          Back to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-medium text-text-primary mb-2">Reset Password</h2>
        <p className="text-text-tertiary">Create a new secure password for your account</p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        {/* New Password Field */}
        <div className="form-group">
          <label className="form-label">New Password</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              <Icon icon="lucide:lock" className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className={`input-gold has-right-icon ${error ? 'border-rose/50' : ''}`}
              required
              disabled={isSubmitting}
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
            >
              <Icon icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'} className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-text-tertiary mt-2">Must be at least 8 characters</p>
        </div>

        {/* Confirm Password Field */}
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              <Icon icon="lucide:lock" className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className={`input-gold has-right-icon ${error ? 'border-rose/50' : ''}`}
              required
              disabled={isSubmitting}
            />
          </div>
          {confirmPassword && (
            <p className={`text-xs mt-1 ${newPassword === confirmPassword ? 'text-green-500' : 'text-rose'}`}>
              {newPassword === confirmPassword ? 'Passwords match!' : 'Passwords do not match'}
            </p>
          )}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || newPassword !== confirmPassword}
          className="w-full btn-gold py-4 rounded-lg font-semibold text-deep flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-deep/30 border-t-deep rounded-full animate-spin" />
              <span>Resetting...</span>
            </>
          ) : (
            <>
              <span>Reset Password</span>
              <Icon icon="lucide:arrow-right" className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <p className="text-center mt-8 text-text-secondary">
        Remember your password?{' '}
        <Link href="/login" className="text-gold hover:text-gold-bright font-medium transition-colors">
          Sign In
        </Link>
      </p>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
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
              Create New <br />
              <span className="text-gradient-gold italic">Password.</span>
            </h1>

            <p className="text-xl text-text-secondary font-light leading-relaxed mb-12">
              Choose a strong password to keep your tasks and data secure.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-6 text-sm text-text-tertiary">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:shield-check" className="w-4 h-4 text-gold" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:lock" className="w-4 h-4 text-rose" />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:zap" className="w-4 h-4 text-gold-bright" />
                <span>Protected</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
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
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <ResetPasswordForm />
            </Suspense>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <Link href="/landing" className="text-sm text-text-tertiary hover:text-gold transition-colors">
              &larr; Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
