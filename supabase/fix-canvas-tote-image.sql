-- Canvas Tote was seeded with the same sneaker image as Runner Sneakers.
-- Run this in the Supabase SQL editor to fix existing data.

update products
set image_url = 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
where name = 'Canvas Tote';
