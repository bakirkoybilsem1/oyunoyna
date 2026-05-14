'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OyunPage({ params }) {
  const [oyun, setOyun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iframeHata, setIframeHata] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    supabase.from('oyunlar').select('*').eq('slug', params.slug).single()
      .then(({ data }) => { setOyun(data); setLoading(false); });
  }, [params.slug]);

  useEffect(() => {
    if (!oyun) return;
    const timer = setTimeout(() => {
      try {
        const iw = iframeRef.current?.contentWindow;
        if (!iw || !iw.document?.body) setIframeHata(true);
      } catch {
        setIframeHata(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [oyun]);

  if (loading) return (
    <div style={{ background: '#0f0c29', height: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Yükleniyor...
    </div>
  );

  if (!oyun) return (
    <div style={{ color: 'white', textAlign: 'center', marginTop: 50 }}>
      Oyun bulunamadı.
    </div>
  );

  const gameUrl = oyun.url || (oyun.html_kodu?.startsWith('http') ? oyun.html_kodu : null);
  const htmlKodu = !gameUrl ? oyun.html_kodu : null;
  const HEADER_H = 56;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f0c29', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      <header style={{ height: HEADER_H, minHeight: HEADER_H, padding: '0 20px', display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)', flexShrink: 0 }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: 14 }}>← Geri Dön</Link>
        <h1 style={{ color: 'white', flex: 1, textAlign: 'center', fontSize: '1.1rem', margin: 0 }}>{oyun.isim}</h1>
        <div style={{ width: 60 }} />
      </header>

      {iframeHata && oyun.yedek_url && (
        <div style={{ background: 'linear-gradient(90deg, #1a1a2e, #16213e)', borderBottom: '1px solid rgba(255,200,0,0.3)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>⚠️ Oyun açılmadıysa</span>
          <a href={oyun.yedek_url} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(135deg, #ffe600, #ff8c00)', color: '#1a0a00', fontWeight: 700, fontSize: '0.82rem', padding: '5px 14px', borderRadius: 20, textDecoration: 'none', boxShadow: '0 0 12px rgba(255,200,0,0.4)', whiteSpace: 'nowrap' }}>
            🔗 buraya tıkla
          </a>
        </div>
      )}

      <div style={{ flex: 1, height: 'calc(100vh - ' + HEADER_H + 'px)', overflow: 'hidden' }}>
        {gameUrl ? (
          <iframe
            ref={iframeRef}
            src={gameUrl}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allowFullScreen
            allow="autoplay; fullscreen"
            onError={() => setIframeHata(true)}
          />
        ) : htmlKodu ? (
          <iframe
            srcDoc={htmlKodu}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: 'white' }}
            allowFullScreen
            allow="autoplay; fullscreen"
          />
        ) : (
          <p style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>Oyun yüklenemedi.</p>
        )}
      </div>
    </div>
  );
}
