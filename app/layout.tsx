import type { Metadata } from 'next';
import type { Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { Sidebar, BottomNav, MobileHeader } from '@/components/Navigation';
import { Toaster } from '@/components/ui/toaster';
import { AuthClientProvider } from '@/auth';
import AuthGuard from '@/components/AuthGuard';
import { CustomCursor } from '@/components/CustomCursor';

// Client components to handle conditional rendering based on path
import { ContentWrapper, LayoutWrapper } from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: 'TRACTION | Modern Expense Tracker',
  description: 'Manage your finances and productivity with TRACTION.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#11131a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased selection:bg-primary/20">
        <CustomCursor>
          <AuthClientProvider>
            <ThemeProvider>
              <AuthGuard>
                <div className="flex min-h-screen">
                  <SidebarWrapper />
                  <main className="relative flex-1 bg-background">
                    <MobileHeaderWrapper />
                    <ContentWrapper>{children}</ContentWrapper>
                    <BottomNavSpacerWrapper />
                  </main>
                  <BottomNavWrapper />
                </div>
              </AuthGuard>
              <Toaster />
            </ThemeProvider>
          </AuthClientProvider>
        </CustomCursor>
      </body>
    </html>
  );
}

function SidebarWrapper() {
  return <LayoutWrapper component={<Sidebar />} />;
}

function MobileHeaderWrapper() {
  return <LayoutWrapper component={<MobileHeader />} />;
}

function BottomNavWrapper() {
  return <LayoutWrapper component={<BottomNav />} />;
}

function BottomNavSpacerWrapper() {
  return (
    <LayoutWrapper
      component={<div className="h-[calc(5.5rem+env(safe-area-inset-bottom))] md:hidden" />}
    />
  );
}
