import { supabase } from '@/lib/supabase';
import type { CartItem, Order } from '@/lib/types';

type OrderRow = {
  id: string;
  customer_name: string;
  email: string;
  shipping_address: string;
  total: number;
  items: CartItem[];
  created_at: string;
};

function mapOrder(row: OrderRow): Order {
  const items = row.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 6 : 0;
  const tax = subtotal * 0.08;

  return {
    id: row.id,
    items,
    subtotal,
    shipping,
    tax,
    total: Number(row.total),
    customer: {
      name: row.customer_name,
      email: row.email,
      address: row.shipping_address,
    },
    createdAt: row.created_at,
  };
}

export async function GET() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_name, email, shipping_address, total, items, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  const orders = (data ?? []).map((row) => mapOrder(row));
  return Response.json({ orders });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Pick<Order, 'items' | 'customer'>;

  if (!body?.items?.length) {
    return Response.json({ message: 'Cart is empty.' }, { status: 400 });
  }

  if (!body.customer?.name || !body.customer?.email || !body.customer?.address) {
    return Response.json({ message: 'Missing customer information.' }, { status: 400 });
  }

  const subtotal = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 6 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: body.customer.name,
      email: body.customer.email,
      shipping_address: body.customer.address,
      total,
      items: body.items,
      created_at: new Date().toISOString(),
    })
    .select('id, customer_name, email, shipping_address, total, items, created_at')
    .single();

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  const order = mapOrder(data);
  return Response.json({ orderId: order.id, order });
}
