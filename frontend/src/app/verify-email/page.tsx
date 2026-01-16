'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { authClient } from '@/lib/auth-client';

type VerificationStatus = 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      // Check if we came from custom verification redirect
      const verified = searchParams.get('verified');
      const error = searchParams.get('error');

      if (verified === 'true') {
        setStatus('success');
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
        return;
      }

      if (error) {
        setStatus('error');
        const errorMessages: { [key: string]: string } = {
          'invalid_token': 'Invalid verification link. Please request a new one.',
          'token_expired': 'This verification link has expired. Please request a new one.',
          'user_not_found': 'User not found. Please try registering again.',
          'missing_params': 'Invalid verification link. Please check your email.',
          'server_error': 'Server error. Please try again later.',
        };
        setErrorMessage(errorMessages[error] || 'Verification failed. Please try again.');
        return;
      }

      // If no verified or error param, show the default error
      // (This page should only be accessed via redirect from custom-verify-email)
      setStatus('error');
      setErrorMessage('No verification status. Please click the link in your email.');
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
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

        {/* Card */}
        <div className="glass-card-static rounded-xl p-8 md:p-10 text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl font-serif font-medium text-text-primary mb-3">
                Verifying Your Email
              </h2>
              <p className="text-text-secondary">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center"
              >
                <Icon icon="lucide:check-circle" className="w-8 h-8 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-serif font-medium text-text-primary mb-3">
                Email Verified!
              </h2>
              <p className="text-text-secondary mb-6">
                Your email has been successfully verified. You can now log in to your account.
              </p>
              <p className="text-text-tertiary text-sm">
                Redirecting to login page...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose/10 flex items-center justify-center"
              >
                <Icon icon="lucide:x-circle" className="w-8 h-8 text-rose" />
              </motion.div>
              <h2 className="text-2xl font-serif font-medium text-text-primary mb-3">
                Verification Failed
              </h2>
              <p className="text-text-secondary mb-6">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full btn-gold py-3 rounded-lg font-semibold text-deep"
                >
                  Go to Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full btn-outline py-3 rounded-lg font-semibold"
                >
                  Create New Account
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/landing" className="text-sm text-text-tertiary hover:text-gold transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
