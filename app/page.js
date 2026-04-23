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

function Balloon({ oyun, index, total }) {
  const [pos, setPos] = useState({ x: 10 + (index / total) * 80, y: 20 + Math.random() * 50 });
  const [vel, setVel] = useState({ x: (Math.random() - 0.5) * 0.3, y: -0.15 - Math.random() * 0.1 });
  const [caught, setCaught] = useState(false);
  const [wobble, setWobble] = useState(0);
  const posRef = useRef(pos);
  const velRef = useRef(vel);
  const rafRef = useRef();
  const [c1, c2] = COLORS[index % COLORS.length];

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    velRef.current = vel;
  }, [vel]);

  useEffect(() => {
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 16, 3);
      last = now;
      setPos(p => {
        let nx = p.x + velRef.current.x * dt;
        let ny = p.y + velRef.current.y * dt;
        let nvx = velRef.current.x;
        let nvy = velRef.current.y;
        // Rüzgar etkisi
        nvx += (Math.random() - 0.5) * 0.02;
        nvy += (Math.random() - 0.5) * 0.01;
        // Sınır kontrolü
        if (nx < 5) { nx = 5; nvx = Math.abs(nvx); }
        if (nx > 90) { nx = 90; nvx = -Math.abs(nvx); }
        if (ny < 5) { ny = 5; nvy = Math.abs(nvy) * 0.5; }
        if (ny > 85) { ny = 85; nvy = -Math.abs(nvy); }
        // Hız sınırı
        nvx = Math.max(-0.5, Math.min(0.5, nvx));
        nvy = Math.max(-0.4, Math.min(0.2, nvy));
        velRef.current = { x: nvx, y: nvy };
        setWobble(w => w + 0.05);
        return { x: nx, y: ny };
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseEnter = () => {
    setCaught(true);
    // Fare yakalayınca balon kaçsın
    setVel(v => ({
      x: (Math.random() - 0.5) * 1.2,
      y: -0.8 - Math.random() * 0.4
    }));
    setTimeout(() => setCaught(false), 300);
  };

  return (
    <Link
      href={`/oyun/${oyun.slug}`}
      onMouseEnter={handleMouseEnter}
      style={{
        position: 'absolute',
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transform: `rotate(${Math.sin(wobble) * 4}deg) scale(${caught ? 1.15 : 1})`,
        transition: 'transform 0.1s',
        zIndex: 10,
        userSelect: 'none',
      }}
    >
      {/* Balon gövdesi */}
      <div style={{ position: 'relative', width: 80, height: 95 }}>
        {/* Ana balon */}
        <div style={{
          width: 80, height: 80,
          borderRadius: '50% 50% 45% 45%',
          background: `radial-gradient(circle at 35% 35%, white, ${c1} 30%, ${c2})`,
          boxShadow: caught ? `0 0 30px ${c1}, 0 8px 32px rgba(0,0,0,0.4)` : `0 8px 32px rgba(0,0,0,0.3)`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          transition: 'box-shadow 0.2s',
        }}>
          {EMOJIS[index % EMOJIS.length]}
          {/* Işık yansıması */}
          <div style={{
            position: 'absolute', top: 12, left: 16,
            width: 18, height: 12,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.45)',
            transform: 'rotate(-30deg)',
          }} />
        </div>
        {/* Balon alt çıkıntısı */}
        <div style={{
          width: 10, height: 10,
          background: c2,
          borderRadius: '0 0 50% 50%',
          margin: '-2px auto 0',
        }} />
        {/* İp */}
        <svg width="20" height="40" style={{ display: 'block', margin: '0 auto' }}>
          <path
            d={`M10 0 Q${6 + Math.sin(wobble * 0.7) * 6} 15 ${10 + Math.sin(wobble * 0.5) * 4} 40`}
            stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none"
          />
        </svg>
      </div>
      {/* Oyun adı */}
      <div style={{
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.8rem',
        textAlign: 'center',
        maxWidth: 90,
        lineHeight: 1.2,
        textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        background: 'rgba(0,0,0,0.35)',
        borderRadius: 8,
        padding: '2px 6px',
        marginTop: 2,
      }}>
        {oyun.isim}
      </div>
    </Link>
  );
}

export default function Home() {
  const [oyunlar, setOyunlar] = useState([]);

  useEffect(() => {
    supabase.from('oyunlar').select('id,isim,slug,renk')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setOyunlar(data); });
  }, []);

  return (
    <main style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative', fontFamily: "'Fredoka One',cursive", background: 'linear-gradient(180deg,#1a1a2e 0%,#16213e 30%,#0f3460 60%,#e94560 100%)' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />

      {/* Dağlar / siluet */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0,200 L0,120 Q180,40 360,100 Q540,160 720,80 Q900,0 1080,90 Q1260,160 1440,100 L1440,200 Z" fill="#0a0a1a" opacity="0.6"/>
        <path d="M0,200 L0,150 Q200,90 400,130 Q600,170 800,110 Q1000,50 1200,120 Q1350,160 1440,140 L1440,200 Z" fill="#0a0a1a" opacity="0.4"/>
      </svg>

      {/* Başlık */}
      <header style={{ textAlign: 'center', padding: '32px 16px 16px', position: 'relative', zIndex: 20 }}>
        <h1 style={{ fontSize: 'clamp(1.1rem,3vw,2.2rem)', color: '#fff', textShadow: '0 4px 24px rgba(240,147,251,0.6)', margin: 0, lineHeight: 1.3 }}>
          🎈 Bakırköy BİLSEM
        </h1>
        <h2 style={{ fontSize: 'clamp(0.8rem,2vw,1.4rem)', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontWeight: 400 }}>
          Dijital Oyun Tasarlama Atölyesi
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginTop: 6 }}>
          🖱️ Balona dokun, oyunu aç!
        </p>
      </header>

      {/* Balonlar alanı */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {oyunlar.length === 0 ? (
          <p style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem', textAlign: 'center', pointerEvents: 'none' }}>
            Henüz oyun eklenmedi 🎈
          </p>
        ) : (
          oyunlar.map((oyun, i) => (
            <div key={oyun.id} style={{ pointerEvents: 'all' }}>
              <Balloon oyun={oyun} index={i} total={oyunlar.length} />
            </div>
          ))
        )}
      </div>
    </main>
  );
}
