'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400 mb-4">
          404
        </h2>
        <p className="text-xl text-slate-400 mb-8">Page not found</p>
        <Link
          href="/"
          className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors inline-block"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
