import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product-detail';
import { getProductById } from '@/lib/products';

type ProductPageProps = {
  params: { id: string };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
