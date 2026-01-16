'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setEmailSent(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Regain <br />
              <span className="text-gradient-gold italic">Access.</span>
            </h1>

            <p className="text-xl text-text-secondary font-light leading-relaxed mb-12">
              Don&apos;t worry, we&apos;ll help you reset your password and get back to organizing your tasks.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-6 text-sm text-text-tertiary">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:shield-check" className="w-4 h-4 text-gold" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:clock-fast" className="w-4 h-4 text-rose" />
                <span>Quick</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:zap" className="w-4 h-4 text-gold-bright" />
                <span>Easy</span>
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
            <AnimatePresence mode="wait">
              {!emailSent ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif font-medium text-text-primary mb-2">Forgot Password?</h2>
                    <p className="text-text-tertiary">Enter your email to receive a reset link</p>
                  </div>

                  <form onSubmit={handleRequestReset} className="space-y-6">
                    {/* Email Field */}
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
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
                      disabled={isSubmitting}
                      className="w-full btn-gold py-4 rounded-lg font-semibold text-deep flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-deep/30 border-t-deep rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Reset Link</span>
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
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center"
                >
                  <div className="mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                      <Icon icon="lucide:mail-check" className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-serif font-medium text-text-primary mb-2">Check Your Email</h2>
                  <p className="text-text-tertiary mb-4">
                    We&apos;ve sent a password reset link to:
                  </p>
                  <p className="text-gold font-medium mb-8">{email}</p>
                  <p className="text-text-tertiary text-sm mb-8">
                    Click the link in the email to reset your password. The link will expire in 1 hour.
                  </p>

                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setEmailSent(false);
                        setEmail('');
                        setError('');
                      }}
                      className="w-full btn-gold py-4 rounded-lg font-semibold text-deep"
                    >
                      Try Different Email
                    </button>

                    <Link
                      href="/login"
                      className="block w-full py-4 rounded-lg font-semibold text-text-secondary border border-white/10 hover:border-gold/30 transition-colors text-center"
                    >
                      Back to Login
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
