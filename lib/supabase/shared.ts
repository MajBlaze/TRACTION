export function getSupabaseConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Accept common Supabase endpoint URLs and normalize to project base URL.
  const url = (rawUrl ?? '')
    .trim()
    .replace(/\/(rest|auth|storage)\/v1\/?$/i, '')
    .replace(/\/+$/, '');

  const hasPlaceholder = url.includes('<your-project-ref>');
  const isValidSupabaseUrl = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/i.test(url);

  if (!url || !publishableKey || hasPlaceholder || !isValidSupabaseUrl) {
    return null;
  }

  return { url, publishableKey };
}
