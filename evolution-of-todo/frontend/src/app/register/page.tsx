'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

type PasswordStrength = 'weak' | 'medium' | 'strong';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Password strength calculation
  const passwordStrength: PasswordStrength = useMemo(() => {
    if (password.length < 6) return 'weak';
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score >= 3 && password.length >= 8) return 'strong';
    if (score >= 2) return 'medium';
    return 'weak';
  }, [password]);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, username, password, fullName);
      setShowSuccess(true);
      toast.success('Account created successfully! Please login.');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
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
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      <Toaster position="bottom-right" />

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-rose/5 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-bright flex items-center justify-center shadow-gold mx-auto mb-4">
            <span className="font-serif font-bold text-2xl text-void">ET</span>
          </div>
          <p className="text-text-tertiary text-sm">Evolution of Todo</p>
        </div>

        {/* Form Card */}
        <div className="glass-card-static rounded-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-medium text-text-primary mb-2">Create Account</h2>
            <p className="text-text-tertiary">Begin your journey to clarity</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field (Optional) */}
            <div className="form-group">
              <label className="form-label">Full Name <span className="text-text-tertiary">(optional)</span></label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                  <Icon icon="lucide:user" className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="input-gold"
                  disabled={isSubmitting}
                />
              </div>
            </div>

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
                  className="input-gold has-right-icon"
                  required
                  disabled={isSubmitting}
                />
                {email && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isEmailValid ? (
                      <Icon icon="lucide:check-circle" className="w-5 h-5 text-green-500" />
                    ) : (
                      <Icon icon="lucide:x-circle" className="w-5 h-5 text-rose" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                  <Icon icon="lucide:at-sign" className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="username"
                  className="input-gold"
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
                  placeholder="Create a password"
                  className="input-gold has-right-icon"
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
              {/* Password Strength Meter */}
              {password && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-1">
                    <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength === 'weak' ? 'bg-rose' :
                      passwordStrength === 'medium' ? 'bg-gold' : 'bg-green-500'
                    }`} />
                    <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength === 'medium' ? 'bg-gold' :
                      passwordStrength === 'strong' ? 'bg-green-500' : 'bg-white/10'
                    }`} />
                    <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength === 'strong' ? 'bg-green-500' : 'bg-white/10'
                    }`} />
                  </div>
                  <p className={`text-xs ${
                    passwordStrength === 'weak' ? 'text-rose' :
                    passwordStrength === 'medium' ? 'text-gold' : 'text-green-500'
                  }`}>
                    {passwordStrength === 'weak' && 'Weak - Add more characters and variety'}
                    {passwordStrength === 'medium' && 'Medium - Consider adding special characters'}
                    {passwordStrength === 'strong' && 'Strong - Great password!'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                  <Icon icon="lucide:lock" className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={`input-gold has-right-icon ${
                    confirmPassword && !passwordsMatch ? 'border-rose/50' : ''
                  }`}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <Icon icon={showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'} className="w-5 h-5" />
                </button>
              </div>
              {confirmPassword && (
                <p className={`text-xs mt-1 ${passwordsMatch ? 'text-green-500' : 'text-rose'}`}>
                  {passwordsMatch ? 'Passwords match!' : 'Passwords do not match'}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center
                  ${acceptTerms
                    ? 'bg-gold border-gold'
                    : 'border-white/20 group-hover:border-gold/50'
                  }`}
                >
                  {acceptTerms && (
                    <Icon icon="lucide:check" className="w-3 h-3 text-void" />
                  )}
                </div>
              </div>
              <span className="text-sm text-text-secondary">
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>

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
              disabled={isSubmitting || !acceptTerms || !passwordsMatch || !isEmailValid}
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
                    <span>Creating account...</span>
                  </motion.div>
                ) : showSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Icon icon="lucide:check-circle" className="w-5 h-5" />
                    <span>Account Created!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span>Create Account</span>
                    <Icon icon="lucide:arrow-right" className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-8 text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-gold hover:text-gold-bright font-medium transition-colors">
              Sign in
            </Link>
          </p>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <Link href="/landing" className="text-sm text-text-tertiary hover:text-gold transition-colors">
              &larr; Back to Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-text-tertiary text-xs mt-6">
          Protected by industry-standard encryption
        </p>
      </motion.div>

      {/* Success Confetti Effect */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  x: '50vw',
                  y: '50vh',
                  scale: 0,
                }}
                animate={{
                  opacity: 0,
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: 1,
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`absolute w-3 h-3 rounded-full ${
                  i % 3 === 0 ? 'bg-gold' : i % 3 === 1 ? 'bg-rose' : 'bg-gold-bright'
                }`}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
