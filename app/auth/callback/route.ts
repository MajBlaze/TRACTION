import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createSession, findOrCreateGoogleUser, SESSION_COOKIE_NAME } from '@/lib/local-auth/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL('/login', requestUrl.origin));
    }

    const {
      data: { user: oauthUser },
    } = await supabase.auth.getUser();

    if (oauthUser?.email) {
      const localUser = await findOrCreateGoogleUser({
        email: oauthUser.email,
        username:
          oauthUser.user_metadata?.user_name ??
          oauthUser.user_metadata?.full_name ??
          oauthUser.email.split('@')[0],
      });

      const token = await createSession(localUser.id);
      const cookieStore = await cookies();

      cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
