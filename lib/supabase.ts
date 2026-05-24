import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

let client: SupabaseClient | undefined;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!client) {
      client = createSupabaseClient();
    }

    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
