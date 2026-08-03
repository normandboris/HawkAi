-- HawkAI database schema

create extension if not exists vector;

create table knowledge_base (
  id           uuid primary key default gen_random_uuid(),
  category     text,
  question     text,
  answer       text,
  source_url   text,
  embedding    vector(512),
  fts          tsvector generated always as (to_tsvector('english', coalesce(answer, '') || ' ' || coalesce(question, ''))) stored, -- leftover from an earlier keyword-search,no longer used since search is now cosine similarity
  last_updated timestamp default now()
);

create table conversations (
  id          uuid primary key default gen_random_uuid(),
  session_id  text,
  role        text,
  message     text,
  confidence  integer,
  created_at  timestamp default now()
);

create table feedback (
  id          uuid primary key default gen_random_uuid(),
  session_id  text,
  question    text,
  answer      text,
  rating      boolean,
  created_at  timestamp default now()
);

create or replace function match_knowledge_base(
  query_embedding vector(512),
  match_count int
)
returns table (
  id          uuid,
  question    text,
  answer      text,
  source_url  text,
  category    text,
  similarity  float
)
language sql stable
as $$
  select
    id, question, answer, source_url, category,
    1 - (embedding <=> query_embedding) as similarity
  from knowledge_base
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
