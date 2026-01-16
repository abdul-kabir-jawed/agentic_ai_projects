"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

function VerifyEmailPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0 || !email) return;

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Verification email sent! Check your inbox.");
        setResendCooldown(60); // 60 second cooldown
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to resend email");
      }
    } catch (error) {
      toast.error("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gold/3 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-block">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-bright flex items-center justify-center shadow-gold mx-auto mb-4">
              <span className="font-serif font-bold text-2xl text-void">ET</span>
            </div>
          </Link>
          <p className="text-text-tertiary text-sm">Evolution of Todo</p>
        </div>

        {/* Card */}
        <div className="glass-card-static rounded-xl p-8 md:p-10 text-center">
          {/* Email Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold/20 to-gold-bright/20 border border-gold/30 flex items-center justify-center"
          >
            <Icon icon="lucide:mail-check" className="w-10 h-10 text-gold" />
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl font-serif font-medium text-text-primary mb-3">
            Check Your <span className="text-gold">Email</span>
          </h1>

          {/* Description */}
          <p className="text-text-secondary mb-6">
            We've sent a verification link to{" "}
            <span className="text-gold font-medium">{email || "your email"}</span>.
            Please check your inbox and click the link to verify your account.
          </p>

          {/* Info Box */}
          <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <Icon icon="lucide:info" className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <div className="text-sm text-text-secondary">
                <p className="font-medium text-gold mb-1">Why verify?</p>
                <p>Email verification helps secure your account and ensures you can recover it if needed.</p>
              </div>
            </div>
          </div>

          {/* Resend Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResendEmail}
            disabled={isResending || resendCooldown > 0 || !email}
            className="w-full py-3.5 px-4 btn-gold text-deep font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isResending ? (
              <>
                <div className="w-5 h-5 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <Icon icon="lucide:timer" className="w-5 h-5" />
                Resend in {resendCooldown}s
              </>
            ) : (
              <>
                <Icon icon="lucide:mail" className="w-5 h-5" />
                Resend Verification Email
              </>
            )}
          </motion.button>

          {/* Back to Login */}
          <button
            onClick={() => router.push("/login")}
            className="mt-4 text-text-secondary hover:text-gold transition-colors text-sm flex items-center justify-center gap-1.5 mx-auto group"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </button>

          {/* Divider */}
          <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Help Text */}
          <div className="flex items-center justify-center gap-2 text-xs text-text-tertiary">
            <Icon icon="lucide:help-circle" className="w-4 h-4" />
            <p>Didn't receive the email? Check your spam folder or try resending.</p>
          </div>
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

function VerifyEmailPendingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function VerifyEmailPendingPage() {
  return (
    <Suspense fallback={<VerifyEmailPendingFallback />}>
      <VerifyEmailPendingContent />
    </Suspense>
  );
}
