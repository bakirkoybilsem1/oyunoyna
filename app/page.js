'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function useSunCycle() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 60000;
    const tick = (now) => {
      setT(((now - start) % duration) / duration);
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);
  return t;
}

function getSkyColors(t) {
  const stops = [
    { t: 0,    sky1: '#0a0a2e', sky2: '#1a0a3e', sun: '#ff6600', horizon: '#1a0a3e' },
    { t: 0.1,  sky1: '#1a0a3e', sky2: '#ff4500', sun: '#ffaa00', horizon: '#ff6600' },
    { t: 0.2,  sky1: '#ff7043', sky2: '#ffb74d', sun: '#fff176', horizon: '#ff8c00' },
    { t: 0.35, sky1: '#42a5f5', sky2: '#90caf9', sun: '#fff9c4', horizon: '#ffcc80' },
    { t: 0.5,  sky1: '#1565c0', sky2: '#42a5f5', sun: '#ffffff', horizon: '#90caf9' },
    { t: 0.65, sky1: '#42a5f5', sky2: '#ff8a65', sun: '#fff9c4', horizon: '#ffcc80' },
    { t: 0.8,  sky1: '#ff5722', sky2: '#ff8c00', sun: '#ffcc02', horizon: '#ff4500' },
    { t: 0.9,  sky1: '#1a0a3e', sky2: '#ff4500', sun: '#ff6600', horizon: '#3d0000' },
    { t: 1,    sky1: '#0a0a2e', sky2: '#1a0a3e', sun: '#ff6600', horizon: '#1a0a3e' },
  ];
  let a = stops[0], b = stops[1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i + 1].t) { a = stops[i]; b = stops[i + 1]; break; }
  }
  const f = a.t === b.t ? 0 : (t - a.t) / (b.t - a.t);
  const lerp = (ca, cb) => {
    const parse = c => [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
    const [r1,g1,b1] = parse(ca), [r2,g2,b2] = parse(cb);
    return `rgb(${Math.round(r1+(r2-r1)*f)},${Math.round(g1+(g2-g1)*f)},${Math.round(b1+(b2-b1)*f)})`;
  };
  return { sky1: lerp(a.sky1,b.sky1), sky2: lerp(a.sky2,b.sky2), sun: lerp(a.sun,b.sun), horizon: lerp(a.horizon,b.horizon) };
}

export default function Home() {
  const [odalar, setOdalar] = useState([]);
  const [oyunSayilari, setOyunSayilari] = useState({});
  const [ziyaretSayisi, setZiyaretSayisi] = useState(null);
  const t = useSunCycle();
  const { sky1, sky2, sun, horizon } = getSkyColors(t);
  const sunY = Math.sin(t * Math.PI) * 75;
  const sunX = 10 + t * 80;
  const isNight = t < 0.12 || t > 0.88;
  const starOpacity = t < 0.15 ? (0.15-t)/0.15 : t > 0.85 ? (t-0.85)/0.15 : 0;
  const stars = useRef(Array.from({length:60}, ()=>({ x:Math.random()*100, y:Math.random()*60, s:Math.random()*2+0.5 }))).current;

  // Ziyaret sayacını artır
  useEffect(() => {
    supabase.rpc('ziyareti_artir').then(({ data, error }) => {
      if (!error && data !== null) {
        setZiyaretSayisi(data);
      }
    });
  }, []);

  // Odaları ve oyun sayılarını çek
  useEffect(() => {
    supabase.from('odalar').select('*').eq('is_active', true).order('sira').then(({ data }) => {
      if (data) {
        setOdalar(data);
        data.forEach(oda => {
          supabase.from('oyunlar').select('id', { count: 'exact' }).eq('oda_id', oda.id).eq('is_active', true).then(({ count }) => {
            setOyunSayilari(prev => ({ ...prev, [oda.id]: count || 0 }));
          });
        });
      }
    });
  }, []);

  return (
    <main style={{ minHeight:'100vh', overflow:'hidden', position:'relative', fontFamily:"'Fredoka One',cursive", background:`linear-gradient(180deg, ${sky1} 0%, ${sky2} 60%, ${horizon} 100%)` }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet"/>

      {/* Pulse animasyonu */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.6); }
        }
        @keyframes counter-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── ZİYARET SAYACI ── */}
      <div style={{
        position: 'fixed',
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        background: 'rgba(0,0,0,0.50)',
        border: '1px solid rgba(255,255,255,0.13)',
        borderRadius: 22,
        padding: '14px 8px 12px',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
        minWidth: 58,
      }}>
        {/* Göz ikonu */}
        <div style={{ fontSize: 20, lineHeight: 1, filter: 'drop-shadow(0 0 6px rgba(255,200,80,0.6))' }}>👁️</div>

        {/* Sayı */}
        <div style={{
          color: '#fff',
          fontSize: '1.35rem',
          fontWeight: 700,
          lineHeight: 1,
          textAlign: 'center',
          textShadow: '0 0 14px rgba(255,210,80,0.9)',
          letterSpacing: '-0.5px',
          animation: ziyaretSayisi !== null ? 'counter-in 0.5s ease' : 'none',
          minWidth: 42,
        }}>
          {ziyaretSayisi === null
            ? <span style={{ opacity: 0.4, fontSize: '1rem' }}>…</span>
            : ziyaretSayisi.toLocaleString('tr-TR')
          }
        </div>

        {/* Etiket */}
        <div style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: '0.55rem',
          textAlign: 'center',
          lineHeight: 1.4,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          ziyaret
        </div>

        {/* Canlı göstergesi — yeşil pulse nokta */}
        <div style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#4ade80',
          boxShadow: '0 0 7px #4ade80, 0 0 14px #4ade8066',
          marginTop: 2,
          animation: 'pulse-dot 2.2s ease-in-out infinite',
        }}/>
      </div>

      {/* Yıldızlar */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} preserveAspectRatio="none">
        {stars.map((s,i) => <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.s} fill="white" opacity={starOpacity * 0.8}/>)}
      </svg>

      {/* Güneş / Ay */}
      <div style={{ position:'absolute', left:`${sunX}%`, bottom:`${sunY}%`, transform:'translate(-50%,50%)', pointerEvents:'none', zIndex:1 }}>
        <div style={{ width:isNight?50:60, height:isNight?50:60, borderRadius:'50%', background:isNight?'radial-gradient(circle at 40% 40%, #fffde7, #fff9c4)':`radial-gradient(circle at 40% 40%, white, ${sun})`, boxShadow:isNight?'0 0 20px rgba(255,255,200,0.4)':`0 0 60px ${sun}, 0 0 120px ${sun}88` }}/>
      </div>

      {/* Dağlar */}
      <svg style={{ position:'absolute', bottom:0, left:0, width:'100%', zIndex:2 }} viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path d="M0,220 L0,130 Q120,60 240,110 Q360,160 480,90 Q600,20 720,100 Q840,170 960,85 Q1080,10 1200,95 Q1320,160 1440,110 L1440,220 Z" fill="#0a0a1a" opacity="0.7"/>
        <path d="M0,220 L0,165 Q180,110 360,145 Q540,175 720,130 Q900,85 1080,140 Q1260,180 1440,150 L1440,220 Z" fill="#050510" opacity="0.85"/>
      </svg>

      {/* Başlık */}
      <header style={{ textAlign:'center', padding:'28px 16px 12px', position:'relative', zIndex:20 }}>
        <h1 style={{ fontSize:'clamp(1.1rem,3vw,2.2rem)', color:'#fff', textShadow:'0 2px 16px rgba(0,0,0,0.8)', margin:0 }}>
          🎈 Bakırköy BİLSEM
        </h1>
        <h2 style={{ fontSize:'clamp(0.8rem,2vw,1.4rem)', color:'rgba(255,255,255,0.85)', margin:'4px 0 0', fontWeight:400, textShadow:'0 2px 8px rgba(0,0,0,0.6)' }}>
          Dijital Oyun Tasarlama Atölyesi
        </h2>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', marginTop:8 }}>✨ Bir oda seç, oyunları keşfet!</p>
      </header>

      {/* ODA KARTLARI */}
      <div style={{ position:'relative', zIndex:10, display:'flex', flexWrap:'wrap', justifyContent:'center', gap:20, padding:'20px 24px 120px', maxWidth:900, margin:'0 auto' }}>
        {odalar.length === 0 && (
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'1.1rem', marginTop:60 }}>Odalar yükleniyor... 🎈</p>
        )}
        {odalar.map((oda, i) => {
          const count = oyunSayilari[oda.id] || 0;
          const rotate = (i % 2 === 0 ? 1 : -1) * (1 + (i % 3));
          return (
            <Link key={oda.id} href={`/oda/${oda.id}`} style={{ textDecoration:'none' }}>
              <div style={{
                width: 160, minHeight: 180,
                background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25), ${oda.renk}88 50%, ${oda.renk}44)`,
                border: `2px solid ${oda.renk}`,
                borderRadius: 24,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '20px 12px',
                cursor: 'pointer',
                transform: `rotate(${rotate}deg)`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: `0 8px 32px ${oda.renk}66, 0 2px 8px rgba(0,0,0,0.3)`,
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = `rotate(0deg) scale(1.08)`; e.currentTarget.style.boxShadow = `0 16px 48px ${oda.renk}99, 0 4px 16px rgba(0,0,0,0.4)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${rotate}deg) scale(1)`; e.currentTarget.style.boxShadow = `0 8px 32px ${oda.renk}66, 0 2px 8px rgba(0,0,0,0.3)`; }}
              >
                <div style={{ fontSize: 48, marginBottom: 10, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>{oda.emoji}</div>
                <div style={{ color:'#fff', fontWeight:700, fontSize:'1.1rem', textAlign:'center', textShadow:'0 2px 8px rgba(0,0,0,0.8)', lineHeight:1.3 }}>{oda.isim}</div>
                <div style={{ marginTop:10, background:'rgba(0,0,0,0.3)', borderRadius:20, padding:'3px 12px', fontSize:'0.75rem', color:'rgba(255,255,255,0.8)' }}>
                  {count} oyun 🎮
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
