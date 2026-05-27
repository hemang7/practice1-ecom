import {
  computeOrderTotals,
  parseOrderItemsJson,
  toCartItemsForStorage,
} from '@/lib/order-utils';
import { getStripe } from '@/lib/stripe';
import { markOrderStockDecremented } from '@/lib/orders-server';
import { decrementStockForOrder } from '@/lib/stock';
import { createClient } from '@/lib/supabase/server';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

type ExistingOrderRow = {
  id: string;
  stock_decremented?: boolean | null;
};

export async function POST(request: Request) {
  const supabase = createClient();
  const stripe = getStripe();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  const sessionId = (body as Record<string, unknown>)?.session_id;

  if (!isNonEmptyString(sessionId)) {
    return Response.json({ message: 'Missing session_id.' }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return Response.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    return Response.json({ message: 'Payment not completed.' }, { status: 400 });
  }

  const metadata = session.metadata;
  if (!metadata) {
    return Response.json({ message: 'Missing session metadata.' }, { status: 400 });
  }

  const customerName = metadata.customer_name;
  const customerEmail = metadata.customer_email;
  const shippingAddress = metadata.shipping_address;
  const itemsJson = metadata.items_json;

  if (
    !isNonEmptyString(customerName) ||
    !isNonEmptyString(customerEmail) ||
    !isNonEmptyString(shippingAddress) ||
    !isNonEmptyString(itemsJson)
  ) {
    return Response.json({ message: 'Missing required metadata.' }, { status: 400 });
  }

  const items = parseOrderItemsJson(itemsJson);
  if (!items) {
    return Response.json({ message: 'Invalid items_json.' }, { status: 400 });
  }

  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id, stock_decremented')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();

  const existing = existingOrder as ExistingOrderRow | null;

  if (existing?.id) {
    if (existing.stock_decremented) {
      return Response.json({ orderId: existing.id });
    }

    const stockResult = await decrementStockForOrder(supabase, items);
    if (!stockResult.ok) {
      return Response.json(
        {
          message: `Order saved but stock update failed: ${stockResult.message}. Add SUPABASE_SERVICE_ROLE_KEY to .env or run supabase/add-order-stock-email.sql.`,
        },
        { status: 500 },
      );
    }

    await markOrderStockDecremented(supabase, existing.id);

    return Response.json({ orderId: existing.id });
  }

  const totals = computeOrderTotals(items);
  const createdAt =
    typeof session.created === 'number'
      ? new Date(session.created * 1000).toISOString()
      : new Date().toISOString();

  const { data: order, error: insertError } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName,
      email: user.email,
      shipping_address: shippingAddress,
      total: totals.total,
      items: toCartItemsForStorage(items),
      created_at: createdAt,
      stripe_session_id: sessionId,
      stock_decremented: false,
    })
    .select('id')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      const { data: duplicateOrder } = await supabase
        .from('orders')
        .select('id, stock_decremented')
        .eq('stripe_session_id', sessionId)
        .maybeSingle();

      const duplicate = duplicateOrder as ExistingOrderRow | null;
      if (duplicate?.id) {
        if (!duplicate.stock_decremented) {
          const stockResult = await decrementStockForOrder(supabase, items);
          if (stockResult.ok) {
            await markOrderStockDecremented(supabase, duplicate.id);
          }
        }
        return Response.json({ orderId: duplicate.id });
      }
    }

    return Response.json({ message: insertError.message }, { status: 500 });
  }

  const stockResult = await decrementStockForOrder(supabase, items);
  if (!stockResult.ok) {
    return Response.json(
      {
        message: `Order saved but stock update failed: ${stockResult.message}. Add SUPABASE_SERVICE_ROLE_KEY to .env or run supabase/add-order-stock-email.sql.`,
        orderId: order.id,
      },
      { status: 500 },
    );
  }

  await markOrderStockDecremented(supabase, order.id);

  return Response.json({ orderId: order.id });
}
