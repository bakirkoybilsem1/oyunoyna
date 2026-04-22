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

      <header style={{ textAlign:'center', padding:'48px 16px 32px', position:'relative', zIndex:10 }}>
        <h1 style={{ fontSize:'clamp(2.5rem,8vw,5rem)', color:'#fff', textShadow:'0 4px 24px rgba(240,147,251,0.6)' }}>
          🪁 OyunOyna
        </h1>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'1.1rem', marginTop:8 }}>Eğlence burada başlar!</p>
      </header>

      <section style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 80px', display:'flex', flexWrap:'wrap', gap:40, justifyContent:'center', position:'relative', zIndex:10 }}>
        {oyunlar.length === 0 ? (
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'1.4rem', marginTop:60 }}>Henüz oyun eklenmedi 🪁</p>
        ) : oyunlar.map((oyun, i) => {
          const [c1,c2] = COLORS[i % COLORS.length];
          const delay = (i * 0.4) % 2.5;
          return (
            <Link key={oyun.id} href={`/oyun/${oyun.slug}`} style={{ textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:90, height:90, position:'relative', animation:`kiteFloat 3s ease-in-out infinite`, animationDelay:`${delay}s`, filter:'drop-shadow(0 10px 20px rgba(0,0,0,0.4))', cursor:'pointer' }}>
                <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${c1},${c2})`, clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)', borderRadius:6 }} />
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>{EMOJIS[i % EMOJIS.length]}</div>
              </div>
              <svg width="6" height="44" style={{ opacity:0.6 }}>
                <path d="M3 0 Q9 11 3 22 Q-3 33 3 44" stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
              </svg>
              <span style={{ color:'#fff', fontWeight:700, fontSize:'0.85rem', textAlign:'center', maxWidth:90, lineHeight:1.2, textShadow:'0 2px 8px rgba(0,0,0,0.5)' }}>{oyun.isim}</span>
            </Link>
          );
        })}
      </section>

      <style>{`
        @keyframes kiteFloat {
          0%,100% { transform:translateY(0px) rotate(-4deg); }
          50% { transform:translateY(-20px) rotate(4deg); }
        }
      `}</style>
    </main>
  );
}
