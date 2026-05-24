import { supabase } from './supabase';
import type { Product } from './types';

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
};

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    image: row.image_url,
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, category, image_url')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapProduct);
}
