import type { Product } from './types';

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
