-- Schema for the "tienda" (small online store) monolith.
-- Safe to run multiple times.
--
-- Design notes:
--   * BIGINT IDENTITY  -> auto-increment primary keys (SQL standard).
--   * money is stored as INTEGER cents (never float/double: floats lose cents).
--   * TIMESTAMPTZ      -> timezone-aware timestamps.
--   * status is TEXT with a CHECK constraint (simpler than a DB enum).

CREATE TABLE IF NOT EXISTS users (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users (id),
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id         BIGINT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id       BIGINT NOT NULL REFERENCES products (id),
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  -- Price snapshot taken when the order was placed. Catalog prices may change
  -- later; the order must keep the price the customer actually agreed to.
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0)
);
