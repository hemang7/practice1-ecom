import { createClient } from './supabase/server';
import type { Product } from './types';

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
};

const productColumns =
  'id, name, description, price, category, image_url, stock_quantity' as const;

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    image: row.image_url,
    stockQuantity: Number(row.stock_quantity),
  };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('products').select(productColumns).order('name');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('products').select(productColumns).eq('id', id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapProduct(data);
}
