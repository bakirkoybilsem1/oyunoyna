'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OyunPage({ params }) {
  const [oyun, setOyun] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('oyunlar').select('*').eq('slug', params.slug).single()
      .then(({ data }) => { setOyun(data); setLoading(false); });
  }, [params.slug]);

  if (loading) return <div style={{ background:'#0f0c29', height:'100vh', color:'white', display:'flex', alignItems:'center', justifyContent:'center' }}>Yükleniyor...</div>;
  if (!oyun) return <div style={{ color:'white', textAlign:'center', marginTop:50 }}>Oyun bulunamadı.</div>;

  const isUrl = oyun.html_kodu?.startsWith('http');
  const kaynakUrl = isUrl ? oyun.html_kodu : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f0c29', fontFamily: "sans-serif" }}>
      <header style={{ padding: '15px', display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>← Geri Dön</Link>
        <h1 style={{ color: 'white', flex: 1, textAlign: 'center', fontSize: '1.2rem', margin: 0 }}>{oyun.isim}</h1>
      </header>

      <div style={{ flex: 1, position: 'relative' }}>
        {oyun.html_kodu ? (
          isUrl ? (
            <iframe src={oyun.html_kodu} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
          ) : (
            <iframe srcDoc={oyun.html_kodu} style={{ width: '100%', height: '100%', border: 'none', background:'white' }} allowFullScreen />
          )
        ) : (
          <p style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>Oyun yüklenemedi.</p>
        )}
      </div>
    </div>
  );
}
