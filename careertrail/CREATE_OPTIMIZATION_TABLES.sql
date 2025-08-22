-- Migration to create document_optimizations table
-- Run this in your Supabase SQL Editor to enable optimization features

-- Create document_optimizations table
create table if not exists public.document_optimizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  document_id uuid not null references public.documents(id) on delete cascade,
  job_description text not null,
  optimization_result jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for better performance
create index if not exists document_optimizations_document_id_idx on public.document_optimizations(document_id);
create index if not exists document_optimizations_user_id_idx on public.document_optimizations(user_id);
create index if not exists document_optimizations_created_at_idx on public.document_optimizations(created_at desc);

-- Enable Row Level Security
alter table public.document_optimizations enable row level security;

-- Create RLS policies
create policy "Users can view their own optimizations"
  on public.document_optimizations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own optimizations"
  on public.document_optimizations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own optimizations"
  on public.document_optimizations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own optimizations"
  on public.document_optimizations for delete
  using (auth.uid() = user_id);

-- Create document_analyses table if it doesn't exist
create table if not exists public.document_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  document_id uuid not null references public.documents(id) on delete cascade,
  result jsonb not null,
  created_at timestamptz not null default now()
);

-- Create indexes for document_analyses
create index if not exists document_analyses_document_id_idx on public.document_analyses(document_id);
create index if not exists document_analyses_user_id_idx on public.document_analyses(user_id);
create index if not exists document_analyses_created_at_idx on public.document_analyses(created_at desc);

-- Enable RLS for document_analyses
alter table public.document_analyses enable row level security;

-- Create RLS policies for document_analyses
create policy "Users can view their own analyses"
  on public.document_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses"
  on public.document_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own analyses"
  on public.document_analyses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own analyses"
  on public.document_analyses for delete
  using (auth.uid() = user_id);
