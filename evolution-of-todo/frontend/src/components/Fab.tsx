'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Fab() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {/* Create Task Button - Secondary Action (appears when menu is open) */}
      <div
        className={`
          transition-all duration-300 ease-out origin-bottom-right
          ${showMenu ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-75 invisible'}
        `}
      >
        <Link href="/?createTask=true" passHref>
          <button
            className={`
              relative
              bg-gradient-to-br from-amber-500 via-orange-400 to-orange-500
              hover:from-amber-400 hover:via-orange-300 hover:to-orange-400
              text-white p-4 rounded-full shadow-xl
              transition-all duration-300 ease-out
              hover:scale-110 hover:shadow-[0_0_20px_rgba(251,146,60,0.5)]
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-950
            `}
            aria-label="Create new task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 drop-shadow-md"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </Link>
      </div>

      {/* AI Chat Button - Primary Action (main FAB) */}
      <Link href="/chat" passHref>
        <button
          className={`
            relative
            bg-gradient-to-br from-cyan-500 via-cyan-400 to-blue-500
            hover:from-cyan-400 hover:via-cyan-300 hover:to-blue-400
            text-white/95 p-4 rounded-full shadow-xl
            transition-all duration-300 ease-out
            hover:scale-110 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950
            backdrop-blur-sm
            border border-cyan-400/30
            group
          `}
          aria-label="Open AI Chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 drop-shadow-md"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {/* Pulse indicator dot */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
        </button>
      </Link>

      {/* Toggle Menu Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`
          relative
          bg-gradient-to-br from-purple-500 via-purple-400 to-pink-500
          hover:from-purple-400 hover:via-purple-300 hover:to-pink-400
          text-white/95 p-3 rounded-full shadow-lg
          transition-all duration-300 ease-out
          hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-950
          border border-purple-400/30
        `}
        aria-label="Toggle action menu"
        aria-expanded={showMenu}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`
            h-5 w-5 transition-transform duration-300 ease-out drop-shadow-md
            ${showMenu ? 'rotate-45 scale-110' : 'rotate-0 scale-100'}
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
