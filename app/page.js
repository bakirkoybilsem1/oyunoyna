'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const COLORS = [
  ['#FF6B6B','#FF8E53'],['#4ECDC4','#44A08D'],['#FCCB90','#D57EEB'],
  ['#96FBC4','#F9F586'],['#FBC2EB','#A6C1EE'],['#FDDB92','#D1FDFF'],
  ['#E0C3FC','#8EC5FC'],['#a1ffce','#faffd1'],
];
const EMOJIS = ['🎮','🚀','⚽','🎯','🧩','🎲','🏆','🌟','🦄','🐉','🎪','🎨','🏎️','🤖','👾','🎸'];

export default function Home() {
  const [oyunlar, setOyunlar] = useState([]);

  useEffect(() => {
    supabase.from('oyunlar').select('id,isim,slug,renk')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setOyunlar(data); });
  }, []);

  return (
    <main style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0f0c29,#302b63,#24243e)', fontFamily:"'Fredoka One',cursive", overflowX:'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />

      <header style={{ textAlign:'center', padding:'48px 16px 32px' }}>
        <div style={{ display:'inline-block', animation:'titleFloat 4s ease-in-out infinite' }}>
          <h1 style={{ fontSize:'clamp(1.2rem,3.5vw,2.4rem)', color:'#fff', textShadow:'0 4px 24px rgba(240,147,251,0.6)', margin:0, lineHeight:1.3 }}>
            🪁 Bakırköy BİLSEM
          </h1>
          <h2 style={{ fontSize:'clamp(0.9rem,2.5vw,1.6rem)', color:'rgba(255,255,255,0.85)', margin:'6px 0 0', fontWeight:400, letterSpacing:'0.02em' }}>
            Dijital Oyun Tasarlama Atölyesi
          </h2>
        </div>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'1rem', marginTop:12 }}>Eğlence burada başlar!</p>
      </header>

      <section style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 80px', display:'flex', flexWrap:'wrap', gap:48, justifyContent:'center' }}>
        {oyunlar.length === 0 ? (
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'1.4rem', marginTop:60 }}>Henüz oyun eklenmedi 🪁</p>
        ) : oyunlar.map((oyun, i) => {
          const [c1,c2] = COLORS[i % COLORS.length];
          // Her uçurtma farklı animasyon süresi ve yön
          const duration = 2.5 + (i * 0.7) % 2;
          const delay = (i * 0.6) % 3;
          const animName = `kite${i % 4}`;
          return (
            <Link key={oyun.id} href={`/oyun/${oyun.slug}`} style={{ textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{
                width:100, height:100, position:'relative',
                animation:`${animName} ${duration}s ease-in-out infinite`,
                animationDelay:`${delay}s`,
                filter:'drop-shadow(0 12px 24px rgba(0,0,0,0.5))',
                cursor:'pointer'
              }}>
                <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${c1},${c2})`, clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)', borderRadius:8 }} />
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>{EMOJIS[i % EMOJIS.length]}</div>
              </div>
              <svg width="8" height="50" style={{ opacity:0.5 }}>
                <path d="M4 0 Q12 12 4 25 Q-4 38 4 50" stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="4,3" />
              </svg>
              <span style={{ color:'#fff', fontWeight:700, fontSize:'0.9rem', textAlign:'center', maxWidth:100, lineHeight:1.2, textShadow:'0 2px 8px rgba(0,0,0,0.5)' }}>{oyun.isim}</span>
            </Link>
          );
        })}
      </section>

      <style>{`
        @keyframes kite0 {
          0%   { transform: translateY(0px) translateX(0px) rotate(-5deg); }
          25%  { transform: translateY(-22px) translateX(10px) rotate(3deg); }
          50%  { transform: translateY(-10px) translateX(-8px) rotate(6deg); }
          75%  { transform: translateY(-28px) translateX(5px) rotate(-3deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(-5deg); }
        }
        @keyframes kite1 {
          0%   { transform: translateY(0px) translateX(0px) rotate(4deg); }
          30%  { transform: translateY(-18px) translateX(-12px) rotate(-4deg); }
          60%  { transform: translateY(-30px) translateX(8px) rotate(7deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(4deg); }
        }
        @keyframes kite2 {
          0%   { transform: translateY(0px) translateX(0px) rotate(-3deg); }
          20%  { transform: translateY(-25px) translateX(6px) rotate(5deg); }
          50%  { transform:
