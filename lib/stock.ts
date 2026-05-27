import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product } from '@/lib/types';
import type { OrderLineItem } from '@/lib/order-utils';
import { createAdminClient, hasAdminClient } from '@/lib/supabase/admin';

export type StockDisplay =
  | { kind: 'out_of_stock' }
  | { kind: 'low_stock'; quantity: number }
  | { kind: 'in_stock' };

export function getStockDisplay(quantity: number): StockDisplay {
  if (quantity <= 0) {
    return { kind: 'out_of_stock' };
  }
  if (quantity <= 10) {
    return { kind: 'low_stock', quantity };
  }
  return { kind: 'in_stock' };
}

export function isOutOfStock(product: Product) {
  return product.stockQuantity <= 0;
}

export function getRemainingStock(product: Product, cartQuantity: number) {
  return Math.max(0, product.stockQuantity - cartQuantity);
}

export function canAddToCart(product: Product, cartQuantity: number, amount = 1) {
  if (isOutOfStock(product)) {
    return false;
  }
  return cartQuantity + amount <= product.stockQuantity;
}

async function decrementWithAdmin(
  items: OrderLineItem[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  const admin = createAdminClient();

  for (const item of items) {
    const { data: product, error: fetchError } = await admin
      .from('products')
      .select('stock_quantity')
      .eq('id', item.id)
      .single();

    if (fetchError || !product) {
      return {
        ok: false,
        message: fetchError?.message ?? `Product not found: ${item.name}`,
      };
    }

    const currentStock = Number(product.stock_quantity);
    const nextStock = Math.max(0, currentStock - item.quantity);

    const { error: updateError } = await admin
      .from('products')
      .update({ stock_quantity: nextStock })
      .eq('id', item.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }
  }

  return { ok: true };
}

async function decrementWithRpc(
  supabase: SupabaseClient,
  items: OrderLineItem[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  for (const item of items) {
    const { error } = await supabase.rpc('decrement_product_stock', {
      p_product_id: item.id,
      p_quantity: item.quantity,
    });

    if (error) {
      return { ok: false, message: error.message };
    }
  }

  return { ok: true };
}

export async function decrementStockForOrder(
  supabase: SupabaseClient,
  items: OrderLineItem[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (hasAdminClient()) {
    return decrementWithAdmin(items);
  }

  return decrementWithRpc(supabase, items);
}
