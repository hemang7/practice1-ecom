-- Run if you already applied an older schema.sql with public order reads.

drop policy if exists "Allow public read on orders" on orders;

create policy "Users can read own orders"
  on orders for select
  using (auth.jwt() ->> 'email' = email);
