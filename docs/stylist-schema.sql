-- Stylist MVP schema (Supabase / Postgres)
-- Run in Supabase SQL editor. Safe to rerun with IF NOT EXISTS blocks.

-- 1) Catalog table
create table if not exists public.style_images (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  storage_path text,

  source_type text not null check (source_type in ('pexels','unsplash','manual','generated')),
  source_page_url text,
  photographer_name text,
  license_type text not null default 'stock',
  attribution jsonb,

  content_type text not null check (content_type in ('full_look','detail','accessory','single_item')),
  gender_target text not null default 'male',

  style_families text[] not null default '{}',
  occasion_tags text[] not null default '{}',
  clothing_tags text[] not null default '{}',
  accessory_tags text[] not null default '{}',
  color_tags text[] not null default '{}',
  season_tags text[] not null default '{}',
  fit_tags text[] not null default '{}',
  vibe_tags text[] not null default '{}',

  formality_level smallint check (formality_level between 1 and 5),
  notes text,

  active boolean not null default true,
  review_status text not null default 'approved' check (review_status in ('pending','approved','rejected')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists style_images_review_active_idx
  on public.style_images (review_status, active);

create index if not exists style_images_style_families_gin
  on public.style_images using gin (style_families);
create index if not exists style_images_color_tags_gin
  on public.style_images using gin (color_tags);
create index if not exists style_images_season_tags_gin
  on public.style_images using gin (season_tags);

-- 2) Votes table
create table if not exists public.user_style_votes (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  image_id uuid not null references public.style_images(id) on delete cascade,
  vote text not null check (vote in ('like','dislike')),
  created_at timestamptz not null default now()
);

create unique index if not exists user_style_votes_unique_session_image
  on public.user_style_votes (session_id, image_id);

create index if not exists user_style_votes_session_idx
  on public.user_style_votes (session_id, created_at desc);

create index if not exists user_style_votes_image_idx
  on public.user_style_votes (image_id);

-- 3) Optional: profile table (for later)
create table if not exists public.user_style_profile (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  liked_style_tags text[] not null default '{}',
  liked_color_tags text[] not null default '{}',
  liked_occasion_tags text[] not null default '{}',
  liked_accessory_tags text[] not null default '{}',
  disliked_tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

