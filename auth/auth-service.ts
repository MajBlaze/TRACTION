'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from '@/lib/supabase/shared';

function notifyAuthChanged() {
  window.dispatchEvent(new Event('traction-auth-changed'));
}

async function postJson<TBody extends object>(url: string, body: TBody) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed.');
  }

  return payload;
}

export function login(_auth: null, email: string, password: string) {
  return postJson('/api/auth/login', { email, password }).then(result => {
    notifyAuthChanged();
    return result;
  });
}

export function signup(_auth: null, username: string, email: string, password: string) {
  return postJson('/api/auth/signup', { username, email, password }).then(result => {
    notifyAuthChanged();
    return result;
  });
}

export function googleSignIn(_auth?: null) {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(
      'Supabase is not configured for Google sign-in. Use your real project URL (https://<project-ref>.supabase.co) in NEXT_PUBLIC_SUPABASE_URL and set NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).'
    );
  }

  const supabase = createBrowserClient(config.url, config.publishableKey);

  return supabase.auth
    .signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    .then(result => {
      if (result.error) {
        throw result.error;
      }

      return result;
    });
}

export function logout(_auth: null) {
  return postJson('/api/auth/logout', {}).then(result => {
    notifyAuthChanged();
    return result;
  });
}
