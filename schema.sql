-- EASY CND Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- 1. Create Companies Table
create table if not exists public.companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  cnpj text not null,
  state_inscription text,
  municipal_inscription text,
  state varchar(2) default 'SP',
  city text default 'São Sebastião',
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for CNPJ queries
create index if not exists companies_cnpj_idx on public.companies(cnpj);
-- Index for user ownership queries
create index if not exists companies_user_id_idx on public.companies(user_id);

-- Enable Row Level Security
alter table public.companies enable row level security;

-- Policies for Companies
create policy "Users can read their own companies" 
  on public.companies for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own companies" 
  on public.companies for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own companies" 
  on public.companies for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own companies" 
  on public.companies for delete 
  using (auth.uid() = user_id);


-- 2. Create Company Certificates Table
create table if not exists public.company_certificates (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  certificate_id text not null, -- matches the certificate types e.g. 'federal', 'fgts', 'trabalhista'
  file_url text not null,
  issue_date date not null,
  expiry_date date not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for company certificates lookup
create index if not exists company_certs_company_id_idx on public.company_certificates(company_id);
create index if not exists company_certs_lookup_idx on public.company_certificates(company_id, certificate_id);

-- Enable Row Level Security
alter table public.company_certificates enable row level security;

-- Policies for Company Certificates (inheriting company access check)
create policy "Users can read their companies' certificates"
  on public.company_certificates for select
  using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

create policy "Users can insert their companies' certificates"
  on public.company_certificates for insert
  with check (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

create policy "Users can update their companies' certificates"
  on public.company_certificates for update
  using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

create policy "Users can delete their companies' certificates"
  on public.company_certificates for delete
  using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );
