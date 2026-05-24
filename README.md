# Next.js 14 Ecommerce Starter

A simple full-stack ecommerce app built with:

- Next.js 14 App Router
- TypeScript
- Tailwind CSS

## Features

- Product listing page
- Shopping cart with add/remove/update quantity
- Order summary page
- Route handlers for products and orders
- Cart state persisted in `localStorage`

## Supabase setup

1. Create a Supabase project and copy your project URL and anon key.
2. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run `supabase/schema.sql` in the Supabase SQL editor to create the `products` and `orders` tables and seed sample products.

## Run it

```bash
npm install
npm run dev
```

## Notes

- Products are loaded from the Supabase `products` table.
- Orders are saved to the Supabase `orders` table when you place an order on the order summary page.
