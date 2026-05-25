import { createClient } from './supabase/server';

/** @deprecated Use createClient from '@/lib/supabase/server' or '@/lib/supabase/client'. */
export function getSupabase() {
  return createClient();
}
