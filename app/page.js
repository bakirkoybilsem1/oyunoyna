'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const COLORS = [['#FF6B6B','#FF8E53'],['#4ECDC4','#44A08D'],['#FCCB90','#D57EEB'],['#96FBC4','#F9F586'],['#FBC2EB','#A6C1EE'],['#FDDB92','#D1FDFF'],['#E0C3FC','#8EC5FC'],['#a1ffce','#faffd1']];
const EMOJIS = ['🎮','🚀','⚽','🎯','🧩','🎲','🏆','🌟','🦄','🐉','🎪','🎨','🏎️','🤖','👾','🎸'];

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
    if (t >= stops[i].t && t <= stops[i+1].t) { a = stops[i]; b = stops[i+1]; break; }
  }
  const f = a.t === b.t ? 0 : (t - a.t) / (b.t - a.t);
  const lerp = (ca, cb) => {
    const parse = c => [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
    const [r1,g1,b1] = parse(ca), [r2,g2,b2] = parse(cb);
    return `rgb(${Math.round(r1+(r2-r1)*f)},${Math.round(g1+(g2-g1)*f)},${Math.round(b1+(b2-b1)*f)})`;
  };
  return { sky1: lerp(a.sky1,b.sky1), sky2: lerp(a.sky2,b.sky2), sun: lerp(a.sun,b.sun), horizon: lerp(a.horizon,b.horizon) };
}

function Balloon({ oyun, index, total }) {
  const [pos, setPos] = useState({ x: 10 + (index / Math.max(total,1)) * 80, y: 20 + (index * 13) % 50 });
  const velRef = useRef({ x: (Math.random()-0.5)*0.3, y: -0.15-Math.random()*0.1 });
  const wobbleRef = useRef(Math.random()*Math.PI*2);
  const [wobble, setWobble] = useState(0);
  const [caught, setCaught] = useState(false);
  const [c1,c2] = COLORS[index % COLORS.length];

  useEffect(() => {
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now-last)/16, 3);
      last = now;
      wobbleRef.current += 0.05 * dt;
      setWobble(wobbleRef.current);
      setPos(p => {
        let nx = p.x + velRef.current.x * dt;
        let ny = p.y + velRef.current.y * dt;
        velRef.current.x += (Math.random()-0.5)*0.02;
        velRef.current.y += (Math.random()-0.5)*0.01;
        if (nx < 3) { nx = 3; velRef.current.x = Math.abs(velRef.current.x); }
        if (nx > 90) { nx = 90; velRef.current.x = -Math.abs(velRef.current.x); }
        if (ny < 5) { ny = 5; velRef.current.y = Math.abs(velRef.current.y)*0.5; }
        if (ny > 80) { ny = 80; velRef.current.y = -Math.abs(velRef.current.y); }
        velRef.current.x = Math.max(-0.5, Math.min(0.5, velRef.current.x));
        velRef.current.y = Math.max(-0.4, Math.min(0.2, velRef.current.y));
        return { x: nx, y: ny };
      });
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const handleMouseEnter = () => {
    setCaught(true);
    velRef.current = { x: (Math.random()-0.5)*1.5, y: -1-Math.random()*0.5 };
    setTimeout(() => setCaught(false), 400);
  };

  return (
    <Link href={`/oyun/${oyun.slug}`} onMouseEnter={handleMouseEnter} style={{ position:'absolute', left:`${pos.x}%`, top:`${pos.y}%`, textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', transform:`rotate(${Math.sin(wobble)*4}deg) scale(${caught?1.2:1})`, transition:'transform 0.15s', zIndex:10, userSelect:'none' }}>
      <div style={{ position:'relative', width:80, height:95 }}>
        <div style={{ width:80, height:80, borderRadius:'50% 50% 45% 45%', background:`radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), ${c1} 30%, ${c2})`, boxShadow: caught?`0 0 30px ${c1},0 8px 32px rgba(0,0,0,0.4)`:`0 8px 32px rgba(0,0,0,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, position:'relative' }}>
          {EMOJIS[index%EMOJIS.length]}
          <div style={{ position:'absolute', top:12, left:16, width:18, height:12, borderRadius:'50%', background:'rgba(255,255,255,0.5)', transform:'rotate(-30deg)' }}/>
        </div>
        <div style={{ width:10, height:10, background:c2, borderRadius:'0 0 50% 50%', margin:'-2px auto 0' }}/>
        <svg width="20" height="40" style={{ display:'block', margin:'0 auto' }}>
          <path d={`M10 0 Q${6+Math.sin(wobble*0.7)*6} 15 ${10+Math.sin(wobble*0.5)*4} 40`} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <div style={{ color:'#fff', fontWeight:700, fontSize:'0.8rem', textAlign:'center', maxWidth:90, lineHeight:1.2, textShadow:'0 2px 8px rgba(0,0,0,0.9)', background:'rgba(0,0,0,0.4)', borderRadius:8, padding:'2px 6px', marginTop:2 }}>
        {oyun.isim}
      </div>
    </Link>
  );
}

export default function Home() {
  const [oyunlar, setOyunlar] = useState([]);
  const t = useSunCycle();
  const { sky1, sky2, sun, horizon } = getSkyColors(t);
  const sunY = Math.sin(t * Math.PI) * 75;
  const sunX = 10 + t * 80;
  const isNight = t < 0.12 || t > 0.88;
  const starOpacity = t < 0.15 ? (0.15-t)/0.15 : t > 0.85 ? (t-0.85)/0.15 : 0;

  useEffect(() => {
    supabase.from('oyunlar').select('id,isim,slug,renk').eq('is_active',true).order('created_at',{ascending:false}).then(({data})=>{ if(data) setOyunlar(data); });
  }, []);

  const stars = useRef(Array.from({length:60}, ()=>({ x:Math.random()*100, y:Math.random()*60, s:Math.random()*2+0.5 }))).current;

  return (
    <main style={{ minHeight:'100vh', overflow:'hidden', position:'relative', fontFamily:"'Fredoka One',cursive", background:`linear-gradient(180deg, ${sky1} 0%, ${sky2} 60%, ${horizon} 100%)`, transition:'background 0.5s' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet"/>

      {/* Yıldızlar */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} preserveAspectRatio="none">
        {stars.map((s,i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.s} fill="white" opacity={starOpacity * (0.5+Math.random()*0.5)}/>
        ))}
      </svg>

      {/* Güneş / Ay */}
      <div style={{ position:'absolute', left:`${sunX}%`, bottom:`${sunY}%`, transform:'translate(-50%,50%)', pointerEvents:'none', zIndex:1 }}>
        <div style={{ width: isNight?50:60, height: isNight?50:60, borderRadius:'50%', background: isNight ? 'radial-gradient(circle at 40% 40%, #fffde7, #fff9c4)' : `radial-gradient(circle at 40% 40%, white, ${sun})`, boxShadow: isNight ? '0 0 20px rgba(255,255,200,0.4)' : `0 0 60px ${sun}, 0 0 120px ${sun}88`, transition:'all 0.5s' }}/>
      </div>

      {/* Dağlar silueti */}
      <svg style={{ position:'absolute', bottom:0, left:0, width:'100%', zIndex:2 }} viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path d="M0,220 L0,130 Q120,60 240,110 Q360,160 480,90 Q600,20 720,100 Q840,170 960,85 Q1080,10 1200,95 Q1320,160 1440,110 L1440,220 Z" fill="#0a0a1a" opacity="0.7"/>
        <path d="M0,220 L0,165 Q180,110 360,145 Q540,175 720,130 Q900,85 1080,140 Q1260,180 1440,150 L1440,220 Z" fill="#050510" opacity="0.85"/>
      </svg>

      {/* Başlık */}
      <header style={{ textAlign:'center', padding:'28px 16px 12px', position:'relative', zIndex:20 }}>
        <h1 style={{ fontSize:'clamp(1.1rem,3vw,2.2rem)', color:'#fff', textShadow:'0 2px 16px rgba(0,0,0,0.8)', margin:0, lineHeight:1.3 }}>
          🎈 Bakırköy BİLSEM
        </h1>
        <h2 style={{ fontSize:'clamp(0.8rem,2vw,1.4rem)', color:'rgba(255,255,255,0.85)', margin:'4px 0 0', fontWeight:400, textShadow:'0 2px 8px rgba(0,0,0,0.6)' }}>
          Dijital Oyun Tasarlama Atölyesi
        </h2>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.8rem', marginTop:4 }}>🖱️ Balona dokun, oyunu aç!</p>
      </header>

      {/* Balonlar */}
      <div style={{ position:'absolute', inset:0, zIndex:5 }}>
        {oyunlar.length===0 ? (
          <p style={{ position:'absolute', top:'45%', left:'50%', transform:'translate(-50%,-50%)', color:'rgba(255,255,255,0.5)', fontSize:'1.2rem', textAlign:'center', pointerEvents:'none' }}>Henüz oyun eklenmedi 🎈</p>
        ) : oyunlar.map((oyun,i) => (
          <Balloon key={oyun.id} oyun={oyun} index={i} total={oyunlar.length}/>
        ))}
      </div>
    </main>
  );
}
