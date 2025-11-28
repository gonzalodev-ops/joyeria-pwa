-- Create a table for storing processed images
create table public.images (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  url text not null,
  original_url text,
  title text,
  category text,
  metadata jsonb
);

-- Create a table for catalogs
create table public.catalogs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  status text default 'draft' check (status in ('draft', 'published')),
  cover_url text,
  views integer default 0,
  background_color text default '#ffffff',
  logo_url text
);

-- Create a junction table for catalog items
create table public.catalog_items (
  catalog_id uuid references public.catalogs(id) on delete cascade,
  image_id uuid references public.images(id) on delete cascade,
  primary key (catalog_id, image_id)
);

-- Set up Row Level Security (RLS)
-- For now, we'll allow public read access, but restrict write access to authenticated users (or anon if using anon key for demo)
alter table public.images enable row level security;
alter table public.catalogs enable row level security;
alter table public.catalog_items enable row level security;

create policy "Public images are viewable by everyone." on public.images for select using (true);
create policy "Public catalogs are viewable by everyone." on public.catalogs for select using (true);
create policy "Public catalog items are viewable by everyone." on public.catalog_items for select using (true);

-- Allow insert/update for anon (for demo purposes, in production restrict to auth users)
create policy "Enable insert for anon users" on public.images for insert with check (true);
create policy "Enable insert for anon users" on public.catalogs for insert with check (true);
create policy "Enable insert for anon users" on public.catalog_items for insert with check (true);
