"use client"

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/auth';
import { signup, googleSignIn } from '@/auth/auth-service';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { TractionLogo } from '@/components/TractionLogo';
import { AuthSnowfall } from '@/components/AuthSnowfall';

export default function SignupPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(auth, username, email, password);
      toast({ title: "Account created!", description: "Welcome to TRACTION." });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await googleSignIn(auth);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-Up failed",
        description: error.message,
      });
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden pb-0 bg-[radial-gradient(circle_at_top,_rgba(124,147,255,0.28),_transparent_30%),radial-gradient(circle_at_80%_16%,_rgba(255,255,255,0.08),_transparent_20%),linear-gradient(180deg,_#07111f_0%,_#0a1930_42%,_#13223b_100%)]">
      <AuthSnowfall />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-sky-200/10 to-transparent" />

      <div className="relative z-10 flex min-h-[100dvh] items-start justify-center px-4 pt-6 pb-0 md:items-center md:p-8">
        <div className="w-full max-w-md space-y-5 md:max-w-lg md:space-y-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <TractionLogo className="h-20 w-20" priority />
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-white md:text-5xl">
              TRACTION
            </h1>
          </div>

          <Card className="rounded-[2rem] border border-white/15 bg-slate-950/38 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>Join thousands of users managing their traction.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl border border-sky-400/30 bg-sky-500 font-bold text-white shadow-lg shadow-sky-950/30 hover:bg-sky-400"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Creating..."
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 text-slate-300">Or continue with</span>
                </div>
              </div>

              <Button variant="outline" className="h-12 w-full rounded-xl" onClick={handleGoogleSignUp}>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-sky-300 transition-colors hover:text-sky-200 hover:underline"
                >
                  Login
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
