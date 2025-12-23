import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Fab } from '@/components/Fab';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Evolution of Todo',
  description: 'Phase II: Web Todo with Persistence - Cosmic Design',
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
          {children}
          <Fab />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}