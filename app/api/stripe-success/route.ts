import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

type MinimalOrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function computeTotals(items: MinimalOrderItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 6 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}

function parseItemsJson(itemsJson: string): MinimalOrderItem[] | null {
  try {
    const parsed = JSON.parse(itemsJson) as unknown;
    if (!Array.isArray(parsed)) return null;

    const items = parsed.filter((item) => {
      return (
        item &&
        typeof item === 'object' &&
        typeof (item as any).id === 'string' &&
        typeof (item as any).name === 'string' &&
        typeof (item as any).price === 'number' &&
        typeof (item as any).quantity === 'number' &&
        (item as any).price >= 0 &&
        (item as any).quantity > 0
      );
    }) as MinimalOrderItem[];

    return items.length ? items : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = createClient();
  const stripe = getStripe();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const sessionId = payload?.session_id;

  if (!isNonEmptyString(sessionId)) {
    return Response.json({ message: 'Missing session_id.' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentStatus = (session as any)?.payment_status as string | undefined;

  if (paymentStatus !== 'paid') {
    return Response.json({ message: 'Payment not completed.' }, { status: 400 });
  }

  const metadata = (session as any)?.metadata as Record<string, string> | null | undefined;
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

  const items = parseItemsJson(itemsJson);
  if (!items) {
    return Response.json({ message: 'Invalid items_json.' }, { status: 400 });
  }

  const totals = computeTotals(items);

  // Ensure email matches the authenticated user for RLS.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? customerEmail;

  if (!isNonEmptyString(email)) {
    return Response.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const createdAt =
    typeof (session as any)?.created === 'number'
      ? new Date((session as any).created * 1000).toISOString()
      : new Date().toISOString();

  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName,
      email,
      shipping_address: shippingAddress,
      total: totals.total,
      items,
      created_at: createdAt,
    })
    .select('id')
    .single();

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json({ orderId: data.id });
}

