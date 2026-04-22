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
          <h2 style={{ fontSize:'clamp(0.9rem,2.5vw,1.6rem)', color:'rgba(255,255,255,0.85)', margin:'6px 0 0', fontWeight:400 }}>
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
          const duration = 2.5 + (i * 0.7) % 2;
          const delay = (i * 0.6) % 3;
          const animName = 'kite' + (i % 4);
          return (
            <Link key={oyun.id} href={'/oyun/' + oyun.slug} style={{ textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:100, height:100, position:'relative', animation:animName + ' ' + duration + 's ease-in-out infinite', animationDelay:delay + 's', filter:'drop-shadow(0 12px 24px rgba(0,0,0,0.5))', cursor:'pointer' }}>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,' + c1 + ',' + c2 + ')', clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)', borderRadius:8 }} />
                <div style={{ position:'ab
