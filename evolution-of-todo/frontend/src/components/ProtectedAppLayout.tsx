'use client';

import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface ProtectedAppLayoutProps {
  children: ReactNode;
  completedCount?: number;
  totalCount?: number;
}

export default function ProtectedAppLayout({
  children,
  completedCount = 0,
  totalCount = 0,
}: ProtectedAppLayoutProps) {
  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden relative">
      {/* Cosmic Aurora Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-900/30 rounded-full blur-[120px] animate-aurora-1 mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-900/20 rounded-full blur-[100px] animate-aurora-2 mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[90px] animate-pulse-glow mix-blend-screen"></div>
        {/* Stars/Particles */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30"></div>
      </div>

      {/* Left Sidebar */}
      <Sidebar completedCount={completedCount} totalCount={totalCount} />

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        {/* Page Content */}
        {children}

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </main>
    </div>
  );
}
