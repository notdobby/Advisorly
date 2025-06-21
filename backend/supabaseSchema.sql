-- Users
create table if not exists users (
  id uuid primary key references auth.users(id),
  name text,
  email text,
  country text,
  currency text,
  income numeric,
  salary_date integer
);

-- Wallets
create table if not exists wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  category text,
  allocated_percent numeric,
  allocated_amount numeric,
  spent_amount numeric
);

-- Transactions
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  category text,
  amount numeric,
  date date,
  notes text
);

-- AI Suggestions
create table if not exists ai_suggestions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  type text,
  reason text,
  accepted boolean,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Budget History
create table if not exists budget_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  month integer,
  year integer,
  data jsonb
);

-- Enable Row Level Security (RLS)
alter table users enable row level security;
alter table wallets enable row level security;
alter table transactions enable row level security;
alter table ai_suggestions enable row level security;
alter table budget_history enable row level security;

-- RLS Policy: Only allow users to access their own data
create policy "Users can access their own profile" on users
  for all using (auth.uid() = id);
create policy "Users can access their own wallets" on wallets
  for all using (auth.uid() = user_id);
create policy "Users can access their own transactions" on transactions
  for all using (auth.uid() = user_id);
create policy "Users can access their own ai_suggestions" on ai_suggestions
  for all using (auth.uid() = user_id);
create policy "Users can access their own budget_history" on budget_history
  for all using (auth.uid() = user_id);

-- Allow authenticated users to insert their own profile
create policy "Users can insert their own profile" on users
  for insert
  with check (auth.uid() = id);

-- Allow authenticated users to insert their own wallets
create policy "Users can insert their own wallets" on wallets
  for insert
  with check (auth.uid() = user_id); 