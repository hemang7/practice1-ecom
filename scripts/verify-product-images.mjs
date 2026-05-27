#!/usr/bin/env node
/**
 * Verifies every product image URL returns HTTP 200 and no duplicates exist.
 * Usage: node scripts/verify-product-images.mjs [baseUrl]
 * Default baseUrl: http://localhost:3000
 */

const baseUrl = process.argv[2] ?? 'http://localhost:3000';

const res = await fetch(`${baseUrl}/api/products`);
if (!res.ok) {
  console.error('Failed to fetch products:', res.status);
  process.exit(1);
}

const { products } = await res.json();
const byBase = new Map();
let broken = 0;

for (const product of products) {
  const base = product.image.split('?')[0];
  const names = byBase.get(base) ?? [];
  names.push(product.name);
  byBase.set(base, names);

  const head = await fetch(product.image, { method: 'HEAD' });
  const ok = head.ok;
  console.log(`${ok ? 'OK' : 'FAIL'} ${product.name}`);
  if (!ok) broken += 1;
}

const dups = [...byBase.entries()].filter(([, names]) => names.length > 1);
if (dups.length) {
  console.error('\nDuplicate images:');
  for (const [, names] of dups) {
    console.error(' -', names.join(', '));
  }
}

if (broken || dups.length) {
  process.exit(1);
}

console.log(`\nAll ${products.length} product images OK.`);
