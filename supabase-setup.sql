-- ============================================================================
-- Pegasus General Store — Supabase setup for the Admin fixes
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL editor for the "Pegasus General Store"
-- project. It is idempotent for the tables and the orders column (re-running
-- it will not duplicate them), except for the supplier seed, which only runs
-- while the suppliers table is empty.
--
-- Existing tables, confirmed from the live schema visualiser, are left
-- untouched except for one added column:
--   admins   (id uuid, email text, created_at timestamp)
--   products (id uuid, name, description, price numeric, category, supplier,
--             image_url, available_for_preorder bool, created_at/updated_at)
--   orders   (id uuid, customer_name, phone, email, items, collection_date
--             date, notes, total numeric, status, created_at, collection_time)
--
-- Admin access follows the existing pattern used by the app: a signed-in
-- user whose user_metadata.role = 'admin' (see authApi.adminLogin).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. suppliers — "The people behind the produce" in the Admin panel
-- ---------------------------------------------------------------------------
create table if not exists public.suppliers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  region        text,
  story         text,
  product_range text,
  image_url     text,
  created_at    timestamptz not null default now()
);

alter table public.suppliers enable row level security;

drop policy if exists "suppliers: public read" on public.suppliers;
create policy "suppliers: public read"
  on public.suppliers for select
  to anon, authenticated
  using (true);

drop policy if exists "suppliers: admin write" on public.suppliers;
create policy "suppliers: admin write"
  on public.suppliers for all
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Seed once, from the 4 entries currently in src/data/suppliers.json.
do $$
begin
  if not exists (select 1 from public.suppliers) then
    insert into public.suppliers (name, region, story, product_range, image_url) values
      ('Bellbird Bakery', 'Christchurch',
       'Artisan bakers crafting sourdough and French-style pastries with a focus on natural fermentation and local flour.',
       'Sourdough breads, French pastries', '/images/sourdough.jpg'),
      ('Safari Meats', 'Christchurch',
       'Specialist South African butchers bringing authentic flavours to Canterbury — biltong, boerewors and marinated specialities.',
       'Biltong, boerewors, sosaties, marinated steaks', '/images/biltong.jpg'),
      ('TGF Gluten Free Bakery', 'Christchurch',
       'A dedicated gluten-free bakery producing treats and baked goods that never compromise on taste or texture.',
       'Gluten-free baked goods, pastries', '/images/gf-bakery.jpg'),
      ('Red Kitchen', 'Auckland',
       'Ready-made meals crafted for quality, nutrition and convenience for busy households.',
       'Ready meals', '/images/ready-meals.jpg');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. store_settings — one row (id = 1) edited from the Admin "Store" tab:
--    address, hours, map coordinates and the open/closed status override.
--    Until this table exists, Admin saves store settings in the browser
--    only (localStorage key pegasus_store_settings).
-- ---------------------------------------------------------------------------
create table if not exists public.store_settings (
  id              int primary key default 1,
  address         text,
  address_short   text,
  phone           text,
  email           text,
  hours           jsonb,
  open_hours      jsonb,
  coords_lat      double precision,
  coords_lng      double precision,
  status_override text not null default 'auto',
  updated_at      timestamptz not null default now()
);

alter table public.store_settings enable row level security;

drop policy if exists "store_settings: public read" on public.store_settings;
create policy "store_settings: public read"
  on public.store_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "store_settings: admin write" on public.store_settings;
create policy "store_settings: admin write"
  on public.store_settings for all
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Seed from the current defaults in src/lib/storeInfo.js. Won't overwrite
-- an existing row (e.g. one already edited in Admin).
insert into public.store_settings
  (id, address, address_short, phone, email, hours, open_hours, coords_lat, coords_lng, status_override)
values (
  1,
  '60 Pegasus Main Street, Pegasus 7612, New Zealand',
  '60 Pegasus Main Street, Pegasus',
  '+64 3 312 6699',
  'hello@pegasusgeneralstore.co.nz',
  '[{"day":"Monday – Friday","time":"7:00 AM – 8:00 PM"},{"day":"Saturday","time":"7:00 AM – 8:00 PM"},{"day":"Sunday","time":"8:00 AM – 6:00 PM"}]'::jsonb,
  '{"0":[8,18],"1":[7,20],"2":[7,20],"3":[7,20],"4":[7,20],"5":[7,20],"6":[7,20]}'::jsonb,
  -43.31228,
  172.69609,
  'auto'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. orders.short_reference — the customer-facing 5-digit code.
--    The full order id stays on the row (and in Admin) as the background
--    reference; customers only ever see pickup date/time + this code.
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists short_reference text;

-- ---------------------------------------------------------------------------
-- 4. Storage bucket "product-images" — Admin image uploads.
-- ---------------------------------------------------------------------------
-- NOTE: inserting into storage.buckets needs a privileged role. If this
-- block is not permitted in the SQL editor, create the bucket instead in
-- Dashboard > Storage (name: product-images, Public: on), then run only
-- the policy section below.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product-images: public read" on storage.objects;
create policy "product-images: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product-images: admin upload" on storage.objects;
create policy "product-images: admin upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "product-images: admin delete" on storage.objects;
create policy "product-images: admin delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- No changes are needed to products (image_url already exists) or to
-- admins, and no change is needed to the hero taglines or the map pin,
-- which are code-only fixes in src/lib/storeInfo.js and
-- src/components/sections/Hero.jsx.
