'use client';

import React, { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { Fab } from './Fab';

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
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden relative bg-void">
      <Toaster position="bottom-right" />

      {/* Background Effects - Matching Landing Page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-rose/5 rounded-full blur-[120px]" />
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

      {/* Chat FAB Button - Shows on all pages except dashboard */}
      <Fab />
    </div>
  );
}
