
"use client"

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function LayoutWrapper({ component }: { component: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) return null;
  return <>{component}</>;
}

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <div
      className={cn(
        isAuthPage
          ? "w-full"
          : "mx-auto w-full max-w-screen-sm px-4 py-4 md:max-w-7xl md:p-8"
      )}
    >
      {children}
    </div>
  );
}
