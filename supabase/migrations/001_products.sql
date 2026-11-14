-- Run once in your Supabase project's SQL Editor. Safe to rerun.
begin;

create table if not exists public.products (
  id bigint primary key,
  title text not null,
  category text not null check (category in ('단권', '패스')),
  price integer not null check (price >= 0),
  original_price integer check (original_price >= price),
  cover text not null check (cover in ('single', 'bundle')),
  subject text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;
drop policy if exists "Anyone can read products" on public.products;
create policy "Anyone can read products" on public.products for select to anon, authenticated using (true);

insert into public.products (id, title, category, price, original_price, cover, subject, description)
select
  i + 1,
  '2026 Hidden Kice 시즌' || ((i / 12) + 1)::text,
  case when (i % 12) in (0,6,8) then '단권' else '패스' end,
  case when (i % 12) in (0,6,8) then 40000 else 64800 end,
  case when (i % 12) in (0,6,8) then null else 68000 end,
  (array['single','bundle','bundle','single','single','bundle','single','bundle','single','bundle','bundle','single'])[(i % 12)+1],
  (array['국어','수학','영어'])[((i / 4) % 3)+1],
  '평가원의 출제 원리를 깊이 있게 분석한 실전 모의고사. 낯선 문제 앞에서도 흔들리지 않는 실력을 완성하세요.'
from generate_series(0,35) as s(i)
on conflict (id) do update set title=excluded.title, category=excluded.category, price=excluded.price,
  original_price=excluded.original_price, cover=excluded.cover, subject=excluded.subject, description=excluded.description;

commit;
