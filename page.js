'use client';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setGames(data || []));
  }, []);

  const colors = [
    ['#FF6B6B', '#FF8E53'],
    ['#4ECDC4', '#44A08D'],
    ['#A8EDEA', '#FED6E3'],
    ['#FCCB90', '#D57EEB'],
    ['#96FBC4', '#F9F586'],
    ['#FBC2EB', '#A6C1EE'],
    ['#FDDB92', '#D1FDFF'],
    ['#E0C3FC', '#8EC5FC'],
  ];

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
      {/* Animated clouds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="cloud" style={{ top: `${10 + i * 15}%`, animationDelay: `${i * 4}s`, animationDuration: `${20 + i * 5}s` }} />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 text-center py-12 px-4">
        <div className="inline-block">
          <h1 className="text-6xl font-black text-white drop-shadow-lg tracking-tight" style={{ fontFamily: "'Fredoka One', cursive", textShadow: '4px 4px 0px rgba(0,0,0,0.2)' }}>
            🎮 OyunOyna
          </h1>
          <p className="text-white/80 text-xl mt-2 font-medium">Eğlence burada başlar!</p>
        </div>
      </header>

      {/* Kites Grid */}
      <section className="relative z-10 px-6 pb-20 max-w-6xl mx-auto">
        {games.length === 0 ? (
          <div className="text-center text-white/70 text-2xl mt-20">Henüz oyun eklenmedi 🪁</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 justify-items-center">
            {games.map((game, i) => {
              const [c1, c2] = colors[i % colors.length];
              const delay = (i * 0.3) % 3;
              return (
                <Link key={game.id} href={`/oyun/${game.slug}`} className="group flex flex-col items-center gap-2">
                  {/* Kite shape */}
                  <div
                    className="kite"
                    style={{
                      '--c1': c1,
                      '--c2': c2,
                      '--delay': `${delay}s`,
                    }}
                  >
                    <div className="kite-inner">
                      <span className="kite-emoji">{game.emoji || '🎮'}</span>
                    </div>
                  </div>
                  {/* String */}
                  <svg width="4" height="40" className="kite-string">
                    <path d="M2 0 Q8 10 2 20 Q-4 30 2 40" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeDasharray="3,2" />
                  </svg>
                  {/* Title */}
                  <span className="text-white font-bold text-center text-sm leading-tight drop-shadow max-w-[100px]" style={{ fontFamily: "'Fredoka One', cursive" }}>
                    {game.title}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');

        .kite {
          width: 80px;
          height: 80px;
          position: relative;
          cursor: pointer;
          animation: float var(--delay, 0s) ease-in-out infinite;
          animation-duration: 3s;
          animation-delay: var(--delay, 0s);
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.25));
          transform-origin: center top;
        }

        .kite::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--c1), var(--c2));
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          border-radius: 4px;
          transition: transform 0.3s ease;
        }

        .kite:hover::before {
          transform: scale(1.15) rotate(5deg);
        }

        .kite-inner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .kite-emoji {
          font-size: 28px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-18px) rotate(3deg); }
        }

        .kite-string {
          opacity: 0.8;
        }

        .cloud {
          position: absolute;
          width: 120px;
          height: 45px;
          background: rgba(255,255,255,0.15);
          border-radius: 50px;
          animation: cloudMove linear infinite;
        }

        .cloud::before, .cloud::after {
          content: '';
          position: absolute;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
        }
        .cloud::before { width: 60px; height: 60px; top: -20px; left: 20px; }
        .cloud::after { width: 40px; height: 40px; top: -15px; left: 60px; }

        @keyframes cloudMove {
          from { left: -150px; }
          to { left: 110%; }
        }
      `}</style>
    </main>
  );
}
