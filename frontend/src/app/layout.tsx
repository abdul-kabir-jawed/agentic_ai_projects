import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatModalProvider } from '@/contexts/ChatModalContext';
import { FocusModeProvider } from '@/contexts/FocusModeContext';
import { ChatModal } from '@/components/ChatModal';
import { Fab } from '@/components/Fab';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Evolution of Todo',
  description: 'Phase II: Web Todo with Persistence - Cosmic Design',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <AuthProvider>
          <ChatModalProvider>
            <FocusModeProvider>
              {children}
              <ChatModal />
              <Fab />
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#1a1a2e',
                    color: '#e0e0e0',
                    border: '1px solid rgba(255,255,255,0.1)',
                  },
                }}
              />
            </FocusModeProvider>
          </ChatModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}