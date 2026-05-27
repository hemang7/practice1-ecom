# Next.js 14 Ecommerce Starter

A simple full-stack ecommerce app built with:

- Next.js 14 App Router
- TypeScript
- Tailwind CSS

## Features

- Product listing page with skeleton loading states
- Product detail pages at `/products/[id]`
- Stock-aware cart (cannot exceed available inventory)
- Shopping cart with add/remove/update quantity
- Order summary page
- Supabase email/password authentication (`/login`, `/signup`)
- Protected order history page (`/orders`)
- Route handlers for products and orders
- Cart state persisted in `localStorage`
- Stripe Checkout for payments
- Stock decremented in Supabase after successful payment

## Supabase setup

1. Create a Supabase project and copy your project URL and anon key.
2. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run `supabase/schema.sql` in the Supabase SQL editor to create the `products` and `orders` tables and seed sample products.
4. In the Supabase dashboard, enable **Email** provider under Authentication → Providers.
5. Add `OPENAI_API_KEY` to `.env.local` for AI product recommendations on product detail pages.
6. Add Stripe keys (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) and `NEXT_PUBLIC_APP_URL` for checkout.
7. If you already ran an older `schema.sql`, also run `supabase/add-order-stock-email.sql`.
8. Add `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API) so the server can update product stock after checkout. Never expose this key in the browser.

## Run it

```bash
npm install
npm run dev
```

## Notes

- Products are loaded from the Supabase `products` table.
- Orders are saved to Supabase after Stripe payment succeeds (via `/api/stripe-success` on the success page).
- Product stock is reduced automatically when the order is saved.
