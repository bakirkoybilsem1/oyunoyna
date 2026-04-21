'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { use } from 'react';

export default function OyunPage({ params }) {
  const { slug } = use(params);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('games')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        setGame(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
        <div className="text-white text-3xl animate-bounce" style={{ fontFamily: "'Fredoka One', cursive" }}>
          🎮 Yükleniyor...
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
        <p className="text-white text-2xl">Oyun bulunamadı 😢</p>
        <Link href="/" className="bg-white text-purple-700 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');`}</style>

      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-black/20 backdrop-blur-sm">
        <Link href="/" className="text-white/80 hover:text-white text-2xl transition-colors">←</Link>
        <span className="text-white font-bold text-xl flex items-center gap-2" style={{ fontFamily: "'Fredoka One', cursive" }}>
          {game.emoji || '🎮'} {game.title}
        </span>
      </div>

      {/* Game iframe */}
      <div className="flex-1 p-3">
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl" style={{ minHeight: 'calc(100vh - 80px)' }}>
          {game.html_content ? (
            <iframe
              srcDoc={game.html_content}
              className="w-full h-full border-0"
              style={{ minHeight: 'calc(100vh - 80px)' }}
              title={game.title}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : game.game_url ? (
            <iframe
              src={game.game_url}
              className="w-full h-full border-0"
              style={{ minHeight: 'calc(100vh - 80px)' }}
              title={game.title}
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/10 text-white text-xl">
              Oyun içeriği bulunamadı 😕
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
