import { getProductById } from '@/lib/products';

type RouteContext = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const product = await getProductById(params.id);

    if (!product) {
      return Response.json({ message: 'Product not found.' }, { status: 404 });
    }

    return Response.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load product.';
    return Response.json({ message }, { status: 500 });
  }
}
