# 🎮 OyunOyna - Kurulum Rehberi

## 1. Supabase Kurulumu

1. [supabase.com](https://supabase.com) → yeni proje oluştur
2. **SQL Editor** sekmesine gir
3. `supabase_setup.sql` dosyasındaki kodu çalıştır
4. **Settings → API** bölümünden şunları kopyala:
   - `Project URL`
   - `anon public` key

## 2. Environment Variables

Projenin kök dizininde `.env.local` dosyası oluştur:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**Vercel'de:** Settings → Environment Variables bölümüne ekle.

## 3. Dosya Yapısı

```
app/
  page.js              ← Ana sayfa (uçurtmalar)
  layout.js            ← HTML wrapper
  globals.css          ← Tailwind
  lib/
    supabase.js        ← Supabase client
  oyun/[slug]/
    page.js            ← Oyun detay (iframe)
  admin/
    page.js            ← Admin panel
```

## 4. Admin Panel Kullanımı

`/admin` adresine git.

### HTML Dosyası ile Oyun Ekle:
1. "Yeni Oyun" tabına tıkla
2. Oyun adını yaz (slug otomatik oluşur)
3. Emoji seç
4. **"HTML Dosyası"** tipini seç
5. `.html` dosyanı yükle
6. **Kaydet**

### URL ile Oyun Ekle:
1. "URL" tipini seç
2. Oyunun URL'sini gir
3. Kaydet

## 5. Oyun Sayfası

Her oyun `/oyun/[slug]` adresinde açılır.
- HTML oyunları: `sandbox` güvenliği ile iframe içinde çalışır
- URL oyunları: Tam ekran iframe

## 6. Deploy (Vercel)

```bash
git add .
git commit -m "Add game platform"
git push
```

Vercel otomatik deploy eder.
