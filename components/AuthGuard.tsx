"use client"

import { useUser } from '@/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { TractionLogo } from './TractionLogo';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading) {
      const isPublicPath = pathname === '/login' || pathname === '/signup';
      
      if (!user && !isPublicPath) {
        router.push('/signup');
      }
    }
  }, [user, isUserLoading, pathname, router]);

  if (isUserLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <TractionLogo className="w-16 h-16 animate-pulse" imageClassName="scale-105" priority />
          <p className="font-bold text-muted-foreground animate-pulse">TRACTION</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}