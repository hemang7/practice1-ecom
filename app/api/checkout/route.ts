import { getAppBaseUrl, getStripe } from '@/lib/stripe';
import type { CartItem } from '@/lib/types';

type CustomerInput = {
  name: string;
  email: string;
  address: string;
};

type MinimalCartItem = Pick<CartItem, 'id' | 'name' | 'price' | 'quantity'>;

function isCartItem(value: unknown): value is MinimalCartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    item.price > 0 &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
}

function isCustomer(value: unknown): value is CustomerInput {
  if (!value || typeof value !== 'object') return false;
  const customer = value as Record<string, unknown>;

  return (
    typeof customer.name === 'string' &&
    customer.name.length > 0 &&
    typeof customer.email === 'string' &&
    customer.email.length > 0 &&
    typeof customer.address === 'string' &&
    customer.address.length > 0
  );
}

function buildLineItems(items: MinimalCartItem[]) {
  const productLines = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 6 : 0;
  const tax = subtotal * 0.08;

  if (shipping > 0) {
    productLines.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Shipping' },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    });
  }

  if (tax > 0) {
    productLines.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tax' },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });
  }

  return productLines;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { items?: unknown; customer?: unknown };

    const items = Array.isArray(body.items) ? body.items.filter(isCartItem) : [];
    if (items.length === 0) {
      return Response.json({ message: 'Cart is empty or invalid.' }, { status: 400 });
    }

    if (!isCustomer(body.customer)) {
      return Response.json({ message: 'Missing customer information.' }, { status: 400 });
    }

    const stripe = getStripe();
    const baseUrl = getAppBaseUrl();

    // Keep metadata small to fit Stripe limits (500 chars per value).
    const minimalItems: MinimalCartItem[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'usd',
      line_items: buildLineItems(items),
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: {
        customer_name: body.customer.name,
        customer_email: body.customer.email,
        shipping_address: body.customer.address,
        items_json: JSON.stringify(minimalItems),
      },
    });

    if (!session.url) {
      return Response.json({ message: 'Failed to create checkout session.' }, { status: 500 });
    }

    return Response.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed.';
    return Response.json({ message }, { status: 500 });
  }
}
