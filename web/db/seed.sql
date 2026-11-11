-- Sample data for local development.
-- Resets the tables first so re-running is idempotent.

TRUNCATE users, products, orders, order_items RESTART IDENTITY CASCADE;

INSERT INTO users (email, name) VALUES
  ('ana@example.com',   'Ana'),
  ('bruno@example.com', 'Bruno');

INSERT INTO products (name, price_cents, stock) VALUES
  ('Teclado',  25000, 10),
  ('Mouse',    12000, 25),
  ('Monitor',  90000,  5);

-- Ana places an order: 1 keyboard + 2 mice.
INSERT INTO orders (user_id, status) VALUES (1, 'pending');

INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES
  (1, 1, 1, 25000),
  (1, 2, 2, 12000);
