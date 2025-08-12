-- Create table to store AI analysis results for documents
create table if not exists public.document_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  document_id uuid not null references public.documents(id) on delete cascade,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists document_analyses_document_id_idx on public.document_analyses(document_id);
create index if not exists document_analyses_user_id_idx on public.document_analyses(user_id);

