-- Tabela de Arquivos
create table if not exists arquivos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  nome_arquivo text not null,
  url_pdf text not null,
  hash_validacao text
);

-- Habilitar RLS
alter table arquivos enable row level security;

-- Políticas de Segurança (RLS)
-- 1. Leitura pública
drop policy if exists "Leitura pública de arquivos" on arquivos;
create policy "Leitura pública de arquivos"
on arquivos for select
to public
using (true);

-- 2. Insert (Demo)
drop policy if exists "Insert liberado para anon (demo)" on arquivos;
create policy "Insert liberado para anon (demo)"
on arquivos for insert
to anon, authenticated
with check (true);

-- Configuração do Storage (Bucket 'documentos')
insert into storage.buckets (id, name, public) 
values ('documentos', 'documentos', true)
on conflict (id) do nothing;

-- Políticas do Storage
drop policy if exists "Leitura pública de documentos" on storage.objects;
create policy "Leitura pública de documentos"
on storage.objects for select
to public
using ( bucket_id = 'documentos' );

drop policy if exists "Upload pública de documentos (demo)" on storage.objects;
create policy "Upload pública de documentos (demo)"
on storage.objects for insert
to anon, authenticated
with check ( bucket_id = 'documentos' );

-- Tabela de Configurações (Logo, etc)
create table if not exists site_settings (
  id int primary key default 1,
  logo_url text, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint single_row check (id = 1)
);

-- Inserir linha inicial se não existir
insert into site_settings (id, logo_url)
values (1, null)
on conflict (id) do nothing;

-- RLS para site_settings
alter table site_settings enable row level security;

drop policy if exists "Leitura pública de settings" on site_settings;
create policy "Leitura pública de settings"
on site_settings for select
to public
using (true);

drop policy if exists "Update settings para anon/auth (demo)" on site_settings;
create policy "Update settings para anon/auth (demo)"
on site_settings for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Insert settings (bloqueado para manter single row)" on site_settings;
create policy "Insert settings (bloqueado para manter single row)"
on site_settings for insert
to authenticated
with check (false);
