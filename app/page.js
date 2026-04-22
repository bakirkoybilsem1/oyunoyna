'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OyunPage({ params }) {
  // Next.js 14'te params direkt obje, 'use(params)' gerekmez
  const slug = params.slug;
  const [oyun, setOyun] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('oyunlar').select('*').eq('slug', slug).single()
      .then(({ data }) => { setOyun(data); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f0c29', color:'white', fontSize:'2rem', fontFamily:"'Fredoka One',cursive" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />
      🎮 Yükleniyor...
    </div>
  );

  if (!oyun) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, background:'#0f0c29', fontFamily:"'Fredoka One',cursive" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka One&display=swap" rel="stylesheet" />
      <p style={{ color:'white', fontSize:'1.5rem' }}>Oyun bulunamadı 😢</p>
      <Link href="/" style={{ background:'linear-gradient(135deg,#f093fb,#f5576c)', color:'white', padding:'12px 28px', borderRadius:50, textDecoration:'none', fontWeight:700 }}>← Ana Sayfa</Link>
    </div>
  );

  const isUrl = oyun.html_kodu?.startsWith('http');
  const isIframe = oyun.html_kodu?.trim().startsWith('<iframe');
  let src = null;
  if (isIframe) { const m = oyun.html_kodu.match(/src=["']([^"']+)["']/); if(m) src=m[1]; }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#0f0c29', fontFamily:"'Fredoka One',cursive" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', background:'rgba(255,255,255,0.07)', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:'1.4rem' }}>←</Link>
        <span style={{ color:'white', fontWeight:700, fontSize:'1.2rem' }}>🎮 {oyun.isim}</span>
      </div>
      <div style={{ flex:1, padding:12 }}>
        <div style={{ width:'100%', borderRadius:20, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.5)', height:'calc(100vh - 80px)' }}>
          {src
            ? <iframe src={src} style={{ width:'100%', height:'100%', border:'none' }} title={oyun.isim} allowFullScreen />
            : isUrl
            ? <iframe src={oyun.html_kodu} style={{ width:'100%', height:'100%', border:'none' }} title={oyun.isim} allowFullScreen />
            : <iframe
                srcDoc={oyun.html_kodu}
                style={{ width:'100%', height:'100%', border:'none' }}
                title={oyun.isim}
                // allow-same-origin kaldırıldı: srcDoc ile birlikte güvenlik açığı yaratabilir
                sandbox="allow-scripts allow-forms allow-popups allow-modals"
              />
          }
        </div>
      </div>
    </div>
  );
}
