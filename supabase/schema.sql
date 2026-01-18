create extension if not exists "uuid-ossp";

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text,
  price numeric(12,2) not null,
  stock integer not null default 0,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists accounts (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  email text not null,
  password text not null,
  status text not null default 'available',
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  telegram_id bigint unique not null,
  username text,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  amount numeric(12,2) not null,
  status text not null default 'pending',
  payment_method text,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  provider text,
  reference text,
  amount numeric(12,2) not null,
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists admin_users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category);
create index if not exists idx_accounts_status on accounts(status);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_payments_status on payments(status);

alter table admin_users enable row level security;

create policy "admin_users_self_read"
on admin_users
for select
to authenticated
using (email = auth.email());
