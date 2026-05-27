-- Chino Shorts image returns 404 on Unsplash (photo removed).
-- Run this in the Supabase SQL editor to fix existing data.

update products
set image_url = 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'
where name = 'Chino Shorts';
