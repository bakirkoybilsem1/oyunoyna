'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { use } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OyunPage({ params }) {
  const { slug } = use(params);
  const [oyun, setOyun] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('oyunlar')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        setOyun(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29, #302b63)',
        fontFamily: "'Fredoka One', cursive", color: 'white', fontSize: '2rem',
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />
        🎮 Yükleniyor...
      </div>
    );
  }

  if (!oyun) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        background: 'linear-gradient(135deg, #0f0c29, #302b63)',
        fontFamily: "'Fredoka One', cursive",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />
        <p style={{ color: 'white', fontSize: '1.5rem' }}>Oyun bulunamadı 😢</p>
        <Link href="/" style={{
          background: 'linear-gradient(135deg, #f093fb, #f5576c)',
          color: 'white', padding: '12px 28px', borderRadius: 50,
          textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
        }}>
          ← Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  // html_kodu doğrudan HTML içeriği mi, yoksa URL mi?
  const isUrl = oyun.html_kodu && (oyun.html_kodu.startsWith('http') || oyun.html_kodu.startsWith('<iframe'));
  const isIframeTag = oyun.html_kodu && oyun.html_kodu.trim().startsWith('<iframe');

  // <iframe src="..."> tag'ı ise src'yi çıkar
  let iframeSrc = null;
  if (isIframeTag) {
    const match = oyun.html_kodu.match(/src=["']([^"']+)["']/);
    if (match) iframeSrc = match[1];
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: '#0f0c29', fontFamily: "'Fredoka One', cursive",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />

      {/* Üst bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <Link href="/" style={{
          color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
          fontSize: '1.4rem', lineHeight: 1,
        }}>
          ←
        </Link>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
          🎮 {oyun.isim}
        </span>
      </div>

      {/* Oyun alanı */}
      <div style={{ flex: 1, padding: 12 }}>
        <div style={{
          width: '100%', borderRadius: 20,
          overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          height: 'calc(100vh - 80px)',
        }}>
          {iframeSrc ? (
            // Eski format: <iframe src="..."> — URL'yi çıkarıp direkt kullan
            <iframe
              src={iframeSrc}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={oyun.isim}
              allowFullScreen
            />
          ) : oyun.html_kodu && oyun.html_kodu.trim().startsWith('http') ? (
            // Sadece URL
            <iframe
              src={oyun.html_kodu}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={oyun.isim}
              allowFullScreen
            />
          ) : oyun.html_kodu ? (
            // Tam HTML içeriği
            <iframe
              srcDoc={oyun.html_kodu}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={oyun.isim}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
              fontSize: '1.2rem',
            }}>
              Oyun içeriği bulunamadı 😕
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
