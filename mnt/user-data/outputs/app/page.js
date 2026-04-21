'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const KITE_COLORS = [
  ['#FF6B6B', '#FF8E53'],
  ['#4ECDC4', '#44A08D'],
  ['#FCCB90', '#D57EEB'],
  ['#96FBC4', '#F9F586'],
  ['#FBC2EB', '#A6C1EE'],
  ['#FDDB92', '#D1FDFF'],
  ['#E0C3FC', '#8EC5FC'],
  ['#a1ffce', '#faffd1'],
];

const EMOJIS = ['🎮','🚀','⚽','🎯','🧩','🎲','🏆','🌟','🦄','🐉','🎪','🎨','🏎️','🤖','👾','🎸'];

export default function Home() {
  const [oyunlar, setOyunlar] = useState([]);

  useEffect(() => {
    supabase
      .from('oyunlar')
      .select('id, isim, slug, renk')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setOyunlar(data);
      });
  }, []);

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f0c29, #302b63, #24243e)',
      overflowX: 'hidden',
      fontFamily: "'Fredoka One', cursive",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />

      {/* Bulutlar */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${8 + i * 13}%`,
            width: 100 + i * 30,
            height: 35,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 50,
            animation: `cloudMove ${18 + i * 6}s linear infinite`,
            animationDelay: `${i * 3}s`,
          }} />
        ))}
      </div>

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '48px 16px 32px' }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          color: '#fff',
          margin: 0,
          textShadow: '0 4px 24px rgba(240,147,251,0.6), 0 2px 0 rgba(0,0,0,0.3)',
          letterSpacing: '-1px',
        }}>
          🪁 OyunOyna
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', marginTop: 8 }}>
          Eğlence burada başlar!
        </p>
      </header>

      {/* Oyun Uçurtmaları */}
      <section style={{
        position: 'relative', zIndex: 10,
        maxWidth: 1100, margin: '0 auto',
        padding: '0 24px 80px',
        display: 'flex', flexWrap: 'wrap',
        gap: 40, justifyContent: 'center',
      }}>
        {oyunlar.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.4rem', marginTop: 60 }}>
            Henüz oyun eklenmedi 🪁
          </p>
        ) : (
          oyunlar.map((oyun, i) => {
            const [c1, c2] = KITE_COLORS[i % KITE_COLORS.length];
            const emoji = EMOJIS[i % EMOJIS.length];
            const delay = (i * 0.4) % 2.5;
            return (
              <Link key={oyun.id} href={`/oyun/${oyun.slug}`}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {/* Uçurtma */}
                <div style={{
                  width: 90, height: 90,
                  position: 'relative',
                  animation: `kiteFloat 3s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}>
                  {/* Uçurtma şekli */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    borderRadius: 6,
                  }} />
                  {/* Emoji */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32,
                  }}>
                    {emoji}
                  </div>
                </div>

                {/* İp */}
                <svg width="6" height="44" style={{ opacity: 0.6 }}>
                  <path d="M3 0 Q9 11 3 22 Q-3 33 3 44"
                    stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
                </svg>

                {/* İsim */}
                <span style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  maxWidth: 90,
                  lineHeight: 1.2,
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}>
                  {oyun.isim}
                </span>
              </Link>
            );
          })
        )}
      </section>

      <style>{`
        @keyframes kiteFloat {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50% { transform: translateY(-20px) rotate(4deg); }
        }
        @keyframes cloudMove {
          from { left: -200px; }
          to { left: 110%; }
        }
        a:hover > div { transform: scale(1.1) !important; }
      `}</style>
    </main>
  );
}
