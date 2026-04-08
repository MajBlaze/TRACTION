"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Users, 
  Calendar, 
  CheckSquare, 
  Settings,
  Plus,
  LogOut,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTractionTheme } from './ThemeContext';
import { useAuth } from '@/auth';
import { logout } from '@/auth/auth-service';
import { TractionLogo } from './TractionLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Expenses', icon: ReceiptText, href: '/expenses' },
  { label: 'Groups', icon: Users, href: '/groups' },
  { label: 'Calendar', icon: Calendar, href: '/calendar' },
  { label: 'Tasks', icon: CheckSquare, href: '/tasks' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { toggleMode, mode, setAccent } = useTractionTheme();

  const handleLogout = async () => {
    try {
      await logout(auth);
      toast({ title: "Logged out", description: "Come back soon!" });
      router.push('/signup');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="hidden md:flex flex-col h-screen w-64 border-r bg-card/30 p-4 sticky top-0">
      <div className="flex items-center gap-2 px-2 mb-8 mt-2">
        <TractionLogo className="w-10 h-10 rounded-xl ring-2 ring-primary/15 shadow-lg" />
        <span className="text-xl font-headline font-bold tracking-tight">TRACTION</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <span className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium",
              pathname === item.href 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="pt-4 border-t space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl">
              <Palette className="w-5 h-5" />
              Theme
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={toggleMode}>
              Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAccent('default')}>Default (Blue-Violet)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAccent('blue')}>Ocean Blue</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAccent('green')}>Emerald Green</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAccent('purple')}>Royal Purple</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAccent('orange')}>Sunset Orange</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAccent('pink')}>Hot Pink</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          className="w-full justify-start gap-3 rounded-xl border border-rose-400/40 bg-rose-500/90 font-semibold text-white shadow-lg shadow-rose-950/25 hover:bg-rose-400"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export const MobileHeader = () => {
  const pathname = usePathname();

  const activeItem = navItems.find(item => item.href === pathname);
  const title = activeItem?.label ?? 'TRACTION';

  return (
    <div className="md:hidden sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[calc(4rem+env(safe-area-inset-top))] max-w-screen-sm items-end justify-between px-4 pb-3 pt-safe">
        <div className="flex items-center gap-3">
          <TractionLogo className="h-10 w-10 rounded-xl ring-2 ring-primary/15 shadow-lg" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              TRACTION
            </p>
            <p className="text-base font-semibold leading-none">{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[calc(4.5rem+env(safe-area-inset-bottom))] max-w-screen-sm items-start justify-around px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      {navItems.slice(0, 5).map((item) => (
        <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-full">
          <div className={cn(
            "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 transition-all duration-200",
            pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
          )}>
            <item.icon className="w-6 h-6" />
            <span className="max-w-full truncate text-[11px] font-medium leading-none">
              {item.label}
            </span>
          </div>
        </Link>
      ))}
      </div>
    </div>
  );
};
