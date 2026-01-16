'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useChatModal } from '@/contexts/ChatModalContext';
import { useFocusMode } from '@/contexts/FocusModeContext';

export function Fab() {
  const pathname = usePathname();
  const { openChat } = useChatModal();
  const { isFocusModeActive } = useFocusMode();
  const [isVisible, setIsVisible] = useState(false);

  // Dashboard pages where FAB should be visible
  const dashboardPages = ['/', '/daily', '/upcoming', '/projects', '/profile'];

  // Auth pages where FAB should NOT be visible
  const authPages = ['/login', '/register', '/landing'];

  // Re-check visibility when pathname or focus mode changes
  useEffect(() => {
    const isOnDashboard = dashboardPages.includes(pathname);
    const isOnAuthPage = authPages.includes(pathname);
    const shouldShow = !isFocusModeActive && !isOnAuthPage && isOnDashboard;

    // Small delay to ensure state has propagated after navigation
    const timer = setTimeout(() => {
      setIsVisible(shouldShow);
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname, isFocusModeActive]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Mobile positioning */}
      <div className="fixed right-4 z-40 md:hidden" style={{ bottom: 'calc(5.5rem + 3.5rem + 1rem)' }}>
        <button
          onClick={openChat}
          className="relative w-14 h-14 rounded-full flex items-center justify-center text-void shadow-xl transition-all duration-300 ease-out hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-slate-950"
          style={{
            background: 'linear-gradient(135deg, #c9a962 0%, #d4b572 100%)',
            boxShadow: '0 4px 20px rgba(201, 169, 98, 0.4)',
          }}
          aria-label="Open AI Chat"
        >
          <Icon icon="lucide:message-circle" className="w-6 h-6 drop-shadow-md" />
        </button>
      </div>

      {/* Desktop positioning */}
      <div className="hidden md:block fixed right-8 z-40" style={{ bottom: 'calc(2rem + 3.5rem + 1rem)' }}>
        <button
          onClick={openChat}
          className="relative w-14 h-14 md:w-14 md:h-14 rounded-full flex items-center justify-center text-void shadow-xl transition-all duration-300 ease-out hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-slate-950"
          style={{
            background: 'linear-gradient(135deg, #c9a962 0%, #d4b572 100%)',
            boxShadow: '0 4px 20px rgba(201, 169, 98, 0.4)',
          }}
          aria-label="Open AI Chat"
        >
          <Icon icon="lucide:message-circle" className="w-6 h-6 drop-shadow-md" />
        </button>
      </div>
    </>
  );
}
