import { getProducts } from '@/lib/products';

export async function GET() {
  try {
    const products = await getProducts();
    return Response.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load products.';
    return Response.json({ message }, { status: 500 });
  }
}
