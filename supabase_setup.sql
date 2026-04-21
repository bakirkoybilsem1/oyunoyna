-- Supabase SQL Editor'da çalıştır

create table if not exists games (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  emoji text default '🎮',
  html_content text,          -- HTML oyun içeriği (dosyadan veya paste)
  game_url text,              -- Dış URL oyunlar için
  created_at timestamp with time zone default now()
);

-- RLS (Row Level Security) - herkes okuyabilsin
alter table games enable row level security;

create policy "Herkes okuyabilir"
  on games for select
  using (true);

create policy "Herkes yazabilir (admin)"
  on games for insert
  with check (true);

create policy "Herkes silebilir (admin)"
  on games for delete
  using (true);

-- Örnek veri (isteğe bağlı)
insert into games (title, slug, emoji, html_content) values
  ('Test Oyunu', 'test-oyunu', '🎮', '<!DOCTYPE html><html><body style="background:#222;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><h1>🎮 Oyun Çalışıyor!</h1></body></html>');
