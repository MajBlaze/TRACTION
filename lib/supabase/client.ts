'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './shared';

export function createClient() {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  const { url, publishableKey } = config;
  return createBrowserClient(url, publishableKey);
}
