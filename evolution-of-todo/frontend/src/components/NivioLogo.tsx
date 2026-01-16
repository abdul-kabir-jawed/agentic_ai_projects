'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface NivioLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  href?: string;
}

export default function NivioLogo({ size = 'md', animated = false, href = '/' }: NivioLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
  };

  const logo = (
    <motion.div
      initial={animated ? { scale: 0.8, rotate: -10 } : false}
      animate={animated ? { scale: 1, rotate: 0 } : false}
      transition={animated ? { duration: 0.5 } : {}}
      className="inline-flex items-center gap-2 group"
    >
      {/* Nivio Icon - Gradient circle with checkmark */}
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="gradientFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#c9a962', stopOpacity: 0.95 }} />
              <stop offset="100%" style={{ stopColor: '#e4c77b', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="30" fill="url(#gradientFill)" stroke="#c9a962" strokeWidth="1.5" />
          <path
            d="M20 34 L28 42 L44 24"
            stroke="#08080a"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      {/* Nivio Text */}
      <span
        className="font-black bg-gradient-to-r from-amber-200 to-yellow-300 bg-clip-text text-transparent transition-all group-hover:from-amber-100 group-hover:to-yellow-200"
        style={{ letterSpacing: '-0.04em' }}
      >
        Nivio
      </span>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }

  return logo;
}
