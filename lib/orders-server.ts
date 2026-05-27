import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient, hasAdminClient } from '@/lib/supabase/admin';

export async function markOrderStockDecremented(
  supabase: SupabaseClient,
  orderId: string,
) {
  if (hasAdminClient()) {
    const admin = createAdminClient();
    const { error } = await admin
      .from('orders')
      .update({ stock_decremented: true })
      .eq('id', orderId);

    if (error) {
      console.error('Failed to mark stock decremented (admin):', error.message);
    }
    return;
  }

  const { error } = await supabase
    .from('orders')
    .update({ stock_decremented: true })
    .eq('id', orderId);

  if (error) {
    console.error('Failed to mark stock decremented:', error.message);
  }
}
