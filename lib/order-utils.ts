import type { CartItem } from '@/lib/types';

export type OrderLineItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export function computeOrderTotals(items: OrderLineItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 6 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return { subtotal, shipping, tax, total };
}

export function parseOrderItemsJson(itemsJson: string): OrderLineItem[] | null {
  try {
    const parsed = JSON.parse(itemsJson) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const items = parsed.filter((item): item is OrderLineItem => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const entry = item as Record<string, unknown>;
      return (
        typeof entry.id === 'string' &&
        typeof entry.name === 'string' &&
        typeof entry.price === 'number' &&
        typeof entry.quantity === 'number' &&
        entry.price >= 0 &&
        entry.quantity > 0
      );
    });

    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

export function toCartItemsForStorage(items: OrderLineItem[]): CartItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: '',
    price: item.price,
    image: '',
    category: '',
    stockQuantity: 0,
    quantity: item.quantity,
  }));
}
