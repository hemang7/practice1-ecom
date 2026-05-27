-- Run in Supabase SQL editor for existing projects.

alter table orders
  add column if not exists stripe_session_id text;

alter table orders
  add column if not exists stock_decremented boolean not null default false;

create unique index if not exists orders_stripe_session_id_key
  on orders (stripe_session_id)
  where stripe_session_id is not null;

create or replace function decrement_product_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_quantity <= 0 then
    return;
  end if;

  update products
  set stock_quantity = greatest(0, stock_quantity - p_quantity)
  where id = p_product_id;
end;
$$;

grant execute on function decrement_product_stock(uuid, integer) to authenticated;

create policy "Users can update own orders"
  on orders for update
  using (auth.jwt() ->> 'email' = email)
  with check (auth.jwt() ->> 'email' = email);
