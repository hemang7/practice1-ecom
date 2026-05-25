-- Run if your products table was created without stock_quantity.

alter table products
  add column if not exists stock_quantity integer not null default 0 check (stock_quantity >= 0);

update products set stock_quantity = 25 where name = 'Cloud Tee' and stock_quantity = 0;
update products set stock_quantity = 12 where name = 'Runner Sneakers' and stock_quantity = 0;
update products set stock_quantity = 18 where name = 'Everyday Hoodie' and stock_quantity = 0;
update products set stock_quantity = 30 where name = 'Canvas Tote' and stock_quantity = 0;
update products set stock_quantity = 8 where name = 'Minimal Watch' and stock_quantity = 0;
update products set stock_quantity = 10 where name = 'Utility Jacket' and stock_quantity = 0;

-- Optional: set one product out of stock for testing
-- update products set stock_quantity = 0 where name = 'Canvas Tote';
