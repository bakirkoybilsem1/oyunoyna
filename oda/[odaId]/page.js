'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const COLORS = [['#FF6B6B','#FF8E53'],['#4ECDC4','#44A08D'],['#FCCB90','#D57EEB'],['#96FBC4','#F9F586'],['#FBC2EB','#A6C1EE'],['#FDDB92','#D1FDFF'],['#E0C3FC','#8EC5FC'],['#a1ffce','#faffd1']];
const EMOJIS = ['🎮','🚀','⚽','🎯','🧩','🎲','🏆','🌟','🦄','🐉','🎪','🎨','🏎️','🤖','👾','🎸','🌈','🦋','🎭','🎠','🔮','🎡','🌺','🎋','🏄','🎻','🦊','🐬','🌙','⚡'];

function useSunCycle() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 60000;
    const tick = (now) => { setT(((now - start) % duration) / duration); requestAnimationFrame(tick); };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);
  return t;
}

function getSkyColors(t) {
  const stops = [
    { t:0,    sky1:'#0a0a2e', sky2:'#1a0a3e', sun:'#ff6600', horizon:'#1a0a3e' },
    { t:0.1,  sky1:'#1a0a3e', sky2:'#ff4500', sun:'#ffaa00', horizon:'#ff6600' },
    { t:0.2,  sky1:'#ff7043', sky2:'#ffb74d', sun:'#fff176', horizon:'#ff8c00' },
    { t:0.35, sky1:'#42a5f5', sky2:'#90caf9', sun:'#fff9c4', horizon:'#ffcc80' },
    { t:0.5,  sky1:'#1565c0', sky2:'#42a5f5', sun:'#ffffff', horizon:'#90caf9' },
    { t:0.65, sky1:'#42a5f5', sky2:'#ff8a65', sun:'#fff9c4', horizon:'#ffcc80' },
    { t:0.8,  sky1:'#ff5722', sky2:'#ff8c00', sun:'#ffcc02', horizon:'#ff4500' },
    { t:0.9,  sky1:'#1a0a3e', sky2:'#ff4500', sun:'#ff6600', horizon:'#3d0000' },
    { t:1,    sky1:'#0a0a2e', sky2:'#1a0a3e', sun:'#ff6600', horizon:'#1a0a3e' },
  ];
  let a = stops[0], b = stops[1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i+1].t) { a = stops[i]; b = stops[i+1]; break; }
  }
  const f = a.t === b.t ? 0 : (t - a.t) / (b.t - a.t);
  const lerp = (ca, cb) => {
    const parse = c => [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
    const [r1,g1,b1] = parse(ca), [r2,g2,b2] = parse(cb);
    return `rgb(${Math.round(r1+(r2-r1)*f)},${Math.round(g1+(g2-g1)*f)},${Math.round(b1+(b2-b1)*f)})`;
  };
  return { sky1:lerp(a.sky1,b.sky1), sky2:lerp(a.sky2,b.sky2), sun:lerp(a.sun,b.sun), horizon:lerp(a.horizon,b.horizon) };
}

export default function OdaSayfasi({ params }) {
  const [oda, setOda] = useState(null);
  const [oyunlar, setOyunlar] = useState([]);
  // Tüm balonların pozisyon/fizik bilgisi tek dizide
  const stateRef = useRef([]);
  const [renderTick, setRenderTick] = useState(0);
  const rafRef = useRef(null);
  const t = useSunCycle();
  const { sky1, sky2, sun, horizon } = getSkyColors(t);
  const sunY = Math.sin(t * Math.PI) * 75;
  const sunX = 10 + t * 80;
  const isNight = t < 0.12 || t > 0.88;
  const starOpacity = t < 0.15 ? (0.15-t)/0.15 : t > 0.85 ? (t-0.85)/0.15 : 0;
  const stars = useRef(Array.from({length:60}, ()=>({ x:Math.random()*100, y:Math.random()*60, s:Math.random()*2+0.5 }))).current;

  useEffect(() => {
    const odaId = params.odaId;
    supabase.from('odalar').select('*').eq('id', odaId).single().then(({ data }) => { if (data) setOda(data); });
    supabase.from('oyunlar').select('id,isim,slug,renk').eq('oda_id', odaId).eq('is_active', true).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setOyunlar(data);
    });
  }, [params.odaId]);

  // Balonlar yüklenince fizik state'i başlat
  useEffect(() => {
    if (oyunlar.length === 0) return;
    stateRef.current = oyunlar.map((_, i) => ({
      x: 5 + (i / Math.max(oyunlar.length, 1)) * 85,
      y: 15 + (i * 11) % 55,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.15 - Math.random() * 0.1,
      wobble: Math.random() * Math.PI * 2,
      caught: false,
      catchTimer: 0,
    }));

    let last = performance.now();
    let frameCount = 0;

    const tick = (now) => {
      const dt = Math.min((now - last) / 16, 3);
      last = now;
      frameCount++;

      stateRef.current = stateRef.current.map(b => {
        let { x, y, vx, vy, wobble, caught, catchTimer } = b;
        wobble += 0.04 * dt;
        vx += (Math.random() - 0.5) * 0.015;
        vy += (Math.random() - 0.5) * 0.008;
        x += vx * dt;
        y += vy * dt;
        if (x < 3)  { x = 3;  vx = Math.abs(vx); }
        if (x > 90) { x = 90; vx = -Math.abs(vx); }
        if (y < 5)  { y = 5;  vy = Math.abs(vy) * 0.5; }
        if (y > 78) { y = 78; vy = -Math.abs(vy); }
        vx = Math.max(-0.45, Math.min(0.45, vx));
        vy = Math.max(-0.38, Math.min(0.18, vy));
        if (catchTimer > 0) catchTimer -= dt;
        if (catchTimer <= 0) caught = false;
        return { x, y, vx, vy, wobble, caught, catchTimer };
      });

      // Her 2 frame'de bir React'i güncelle → daha az re-render, daha akıcı
      if (frameCount % 2 === 0) setRenderTick(n => n + 1);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [oyunlar]);

  const handleCatch = (i) => {
    const s = stateRef.current[i];
    if (!s) return;
    stateRef.current[i] = { ...s, caught: true, catchTimer: 25, vx: (Math.random()-0.5)*1.5, vy: -1 - Math.random()*0.5 };
  };

  return (
    <main style={{ minHeight:'100vh', overflow:'hidden', position:'relative', fontFamily:"'Fredoka One',cursive", background:`linear-gradient(180deg, ${sky1} 0%, ${sky2} 60%, ${horizon} 100%)` }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet"/>

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
      <header style={{ textAlign:'center', padding:'20px 16px 8px', position:'relative', zIndex:20, display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
        <Link href="/" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:'1.5rem', position:'absolute', left:20 }}>←</Link>
        <div>
          <h1 style={{ fontSize:'clamp(1.2rem,3vw,2rem)', color:'#fff', textShadow:'0 2px 16px rgba(0,0,0,0.8)', margin:0 }}>
            {oda ? `${oda.emoji} ${oda.isim}` : '🎈 Yükleniyor...'}
          </h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.8rem', margin:'4px 0 0' }}>🖱️ Balona dokun, oyunu aç!</p>
        </div>
      </header>

      {/* BALONLAR — tek döngü, hepsi burada */}
      <div style={{ position:'absolute', inset:0, zIndex:5 }}>
        {oyunlar.length === 0 && (
          <p style={{ position:'absolute', top:'45%', left:'50%', transform:'translate(-50%,-50%)', color:'rgba(255,255,255,0.5)', fontSize:'1.2rem', textAlign:'center', pointerEvents:'none' }}>
            Bu odaya henüz oyun eklenmedi 🎈
          </p>
        )}
        {oyunlar.map((oyun, i) => {
          const b = stateRef.current[i];
          if (!b) return null;
          const [c1, c2] = COLORS[i % COLORS.length];
          const sinW = Math.sin(b.wobble);
          return (
            <Link
              key={oyun.id}
              href={`/oyun/${oyun.slug}`}
              onMouseEnter={() => handleCatch(i)}
              style={{
                position: 'absolute',
                left: `${b.x}%`,
                top: `${b.y}%`,
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transform: `rotate(${sinW * 4}deg) scale(${b.caught ? 1.2 : 1})`,
                transition: 'transform 0.12s',
                zIndex: 10,
                userSelect: 'none',
                willChange: 'transform, left, top',
              }}
            >
              <div style={{ position:'relative', width:80, height:95 }}>
                <div style={{ width:80, height:80, borderRadius:'50% 50% 45% 45%', background:`radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), ${c1} 30%, ${c2})`, boxShadow:b.caught?`0 0 30px ${c1},0 8px 32px rgba(0,0,0,0.4)`:`0 8px 32px rgba(0,0,0,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, position:'relative' }}>
                  {EMOJIS[i % EMOJIS.length]}
                  <div style={{ position:'absolute', top:12, left:16, width:18, height:12, borderRadius:'50%', background:'rgba(255,255,255,0.5)', transform:'rotate(-30deg)' }}/>
                </div>
                <div style={{ width:10, height:10, background:c2, borderRadius:'0 0 50% 50%', margin:'-2px auto 0' }}/>
                <svg width="20" height="40" style={{ display:'block', margin:'0 auto' }}>
                  <path d={`M10 0 Q${6+sinW*6} 15 ${10+Math.sin(b.wobble*0.5)*4} 40`} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:'0.8rem', textAlign:'center', maxWidth:90, lineHeight:1.2, textShadow:'0 2px 8px rgba(0,0,0,0.9)', background:'rgba(0,0,0,0.4)', borderRadius:8, padding:'2px 6px', marginTop:2 }}>
                {oyun.isim}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
