-- Run in the Supabase SQL editor to create tables and seed sample products.

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric not null,
  category text not null,
  image_url text not null
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text not null,
  shipping_address text not null,
  total numeric not null,
  items jsonb not null,
  created_at timestamptz not null default now()
);

alter table products enable row level security;
alter table orders enable row level security;

create policy "Allow public read on products"
  on products for select
  using (true);

create policy "Allow public insert on orders"
  on orders for insert
  with check (true);

create policy "Allow public read on orders"
  on orders for select
  using (true);

insert into products (name, description, price, category, image_url) values
  ('Cloud Tee', 'Soft heavyweight tee for everyday wear.', 28, 'Tops', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'),
  ('Runner Sneakers', 'Lightweight sneakers with all-day comfort.', 84, 'Shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'),
  ('Everyday Hoodie', 'Relaxed fit hoodie with a clean silhouette.', 62, 'Outerwear', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'),
  ('Canvas Tote', 'Durable tote bag for errands and commute.', 24, 'Accessories', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'),
  ('Minimal Watch', 'Simple watch with a modern matte finish.', 119, 'Accessories', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'),
  ('Utility Jacket', 'Light jacket with practical pockets and style.', 98, 'Outerwear', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');
