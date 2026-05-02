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

const CARD_STYLES = ['neon-yellow','holo-green','crystal-blue','fusion-orange','crystal-red'];

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

  useEffect(() => {
    async function sayaciArtir() {
      const { data, error } = await supabase
        .from('ziyaret_sayaci').select('sayi').eq('id', 1).single();
      if (error) { console.error('Sayaç okuma hatası:', error.message); return; }
      const yeniSayi = (data?.sayi ?? 0) + 1;
      const { error: updateError } = await supabase
        .from('ziyaret_sayaci').update({ sayi: yeniSayi }).eq('id', 1);
      if (updateError) {
        console.error('Sayaç güncelleme hatası:', updateError.message);
        setZiyaretSayisi(data?.sayi ?? 0);
        return;
      }
      setZiyaretSayisi(yeniSayi);
    }
    sayaciArtir();
  }, []);

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
    <main style={{
      minHeight: '100vh', overflow: 'hidden', position: 'relative',
      fontFamily: "'Fredoka One',cursive",
      background: `linear-gradient(180deg, ${sky1} 0%, ${sky2} 60%, ${horizon} 100%)`
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Syne:wght@800&family=Space+Grotesk:wght@500&display=swap" rel="stylesheet"/>

      <style>{`
        .oda-card {
          width: 160px; min-height: 180px; border-radius: 24px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 20px 12px; cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          text-decoration: none;
        }
        .oda-card:hover { transform: translateY(-10px) scale(1.07); }
        .card-emoji { font-size:48px; margin-bottom:10px; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.4)); position:relative; z-index:1; }
        .card-name  { color:#fff; font-weight:700; font-size:1.1rem; text-align:center; line-height:1.3; position:relative; z-index:1; }
        .card-badge { margin-top:10px; border-radius:20px; padding:3px 12px; font-size:0.75rem; color:rgba(255,255,255,0.85); position:relative; z-index:1; }

        @keyframes holo-spin     { to { transform: rotate(360deg); } }
        @keyframes crystal-pulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.7;transform:scale(1.3)} }
        @keyframes sweep         { 0%{left:-100%} 100%{left:150%} }
        @keyframes live-ping     { 0%,100%{box-shadow:0 0 0 0 rgba(134,239,172,0.8)} 50%{box-shadow:0 0 0 6px rgba(134,239,172,0)} }
        @keyframes num-pop       { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }

        .card-neon-yellow {
          background: rgba(0,0,0,0.55);
          border: 2px solid #ffe600;
          box-shadow: 0 0 8px #ffe600, 0 0 24px #ffe600, 0 0 50px rgba(255,230,0,0.3), inset 0 0 20px rgba(255,230,0,0.04);
        }
        .card-neon-yellow::before {
          content:''; position:absolute; inset:-2px; border-radius:26px;
          border:2px solid #ffe600; filter:blur(8px); opacity:0.6; pointer-events:none;
        }
        .card-neon-yellow::after {
          content:''; position:absolute; top:0; left:10%; right:10%; height:1px;
          background:linear-gradient(90deg,transparent,#ffe600,transparent); pointer-events:none;
        }
        .card-neon-yellow .card-badge { background:rgba(255,230,0,0.12); border:1px solid #ffe600; color:#ffe600; }
        .card-neon-yellow .card-name  { text-shadow:0 0 16px rgba(255,230,0,0.8),0 2px 8px rgba(0,0,0,0.8); }

        .card-holo-green {
          background: linear-gradient(135deg,rgba(0,255,100,0.1),rgba(0,200,80,0.05),rgba(0,255,150,0.08));
          border: 1px solid rgba(0,255,100,0.4);
          backdrop-filter: blur(12px);
        }
        .card-holo-green::before {
          content:''; position:absolute; inset:0; border-radius:24px; pointer-events:none;
          background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,100,0.03) 3px,rgba(0,255,100,0.03) 4px);
        }
        .card-holo-green::after {
          content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; pointer-events:none;
          background:conic-gradient(from 0deg,transparent 0deg,rgba(0,255,100,0.08) 60deg,rgba(0,200,50,0.06) 120deg,transparent 180deg);
          animation:holo-spin 5s linear infinite;
        }
        .card-holo-green .card-badge { background:rgba(0,255,100,0.12); border:1px solid rgba(0,255,100,0.4); color:#00ff64; }
        .card-holo-green .card-name  { text-shadow:0 0 20px rgba(0,255,100,0.8),0 2px 8px rgba(0,0,0,0.8); }

        .card-crystal-blue {
          background: linear-gradient(145deg,rgba(0,150,255,0.2) 0%,rgba(0,80,200,0.06) 40%,rgba(0,200,255,0.14) 100%);
          border: 1px solid rgba(0,180,255,0.5);
          backdrop-filter: blur(20px);
        }
        .card-crystal-blue::before {
          content:''; position:absolute; top:-30%; left:-20%; width:60%; height:60%; pointer-events:none;
          background:radial-gradient(ellipse,rgba(100,200,255,0.4) 0%,transparent 70%);
          border-radius:50%; transform:rotate(-30deg);
        }
        .card-crystal-blue::after {
          content:''; position:absolute; bottom:10%; right:-10%; width:40%; height:40%; pointer-events:none;
          background:radial-gradient(ellipse,rgba(0,150,255,0.5) 0%,transparent 70%);
          animation:crystal-pulse 3s ease-in-out infinite;
        }
        .card-crystal-blue .card-badge { background:rgba(0,150,255,0.18); border:1px solid rgba(0,180,255,0.4); color:rgba(100,210,255,0.95); }
        .card-crystal-blue .card-name  { text-shadow:0 0 24px rgba(0,180,255,0.8),0 2px 8px rgba(0,0,0,0.8); }

        .card-fusion-orange {
          background: linear-gradient(135deg,rgba(255,100,0,0.14),rgba(255,60,0,0.08));
          border: 2px solid #ff6600;
          box-shadow: 0 0 10px #ff6600, 0 0 28px rgba(255,100,0,0.4), inset 0 0 25px rgba(255,100,0,0.05);
        }
        .card-fusion-orange::before {
          content:''; position:absolute; inset:0; border-radius:24px; pointer-events:none;
          background:repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,100,0,0.04) 8px,rgba(255,100,0,0.04) 9px);
        }
        .card-fusion-orange::after {
          content:''; position:absolute; top:-50%; left:-100%; width:80%; height:200%; pointer-events:none;
          background:linear-gradient(90deg,transparent,rgba(255,150,50,0.15),transparent);
          animation:sweep 2.5s ease-in-out infinite;
        }
        .card-fusion-orange .card-badge { background:rgba(255,100,0,0.2); border:1px solid #ff6600; color:#ffaa44; }
        .card-fusion-orange .card-name  { text-shadow:0 0 20px rgba(255,100,0,0.9),0 2px 8px rgba(0,0,0,0.8); }

        .card-crystal-red {
          background: linear-gradient(160deg,rgba(255,0,60,0.15),rgba(200,0,40,0.06));
          border: 2px solid #ff2244;
          box-shadow: 0 0 10px #ff2244, 0 0 28px rgba(255,0,60,0.35), inset 0 0 25px rgba(255,0,60,0.06);
        }
        .card-crystal-red::before {
          content:''; position:absolute; top:-40%; left:-20%; width:70%; height:70%; pointer-events:none;
          background:radial-gradient(ellipse,rgba(255,80,100,0.25) 0%,transparent 70%);
        }
        .card-crystal-red::after {
          content:''; position:absolute; bottom:-20%; right:-20%; width:60%; height:60%; pointer-events:none;
          background:radial-gradient(ellipse,rgba(255,0,60,0.25) 0%,transparent 70%);
          animation:crystal-pulse 4s ease-in-out infinite reverse;
        }
        .card-crystal-red .card-badge { background:rgba(255,0,60,0.2); border:1px solid #ff2244; color:#ff8899; }
        .card-crystal-red .card-name  { text-shadow:0 0 20px rgba(255,30,70,0.9),0 2px 8px rgba(0,0,0,0.8); }
      `}</style>

      {/* ZİYARET SAYACI */}
      <div style={{
        position:'fixed', left:16, top:'50%', transform:'translateY(-50%)',
        zIndex:50, display:'flex', flexDirection:'column', alignItems:'center', gap:6,
      }}>
        <div style={{
          width:72, height:72, borderRadius:'50%', overflow:'hidden',
          border:'2px solid rgba(255,255,255,0.35)', background:'#0a0a0a', flexShrink:0,
        }}>
          <video
            autoPlay loop muted playsInline
            src="https://ppbmdnnnlleoptdinzsn.supabase.co/storage/v1/object/public/suppilami.mp4/suppilami.mp4"
            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }}
          />
        </div>

        <span style={{
          fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1.6rem',
          color:'#fff', lineHeight:1, letterSpacing:'-1px',
          textShadow:'0 2px 10px rgba(0,0,0,0.35)',
          animation: ziyaretSayisi !== null ? 'num-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
        }}>
          {ziyaretSayisi === null
            ? <span style={{ opacity:0.3, fontSize:'1rem' }}>…</span>
            : ziyaretSayisi.toLocaleString('tr-TR')
          }
        </span>

        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:'0.6rem', color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.12em' }}>ziyaret</span>
          <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.6rem' }}>·</span>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#86efac', display:'inline-block', animation:'live-ping 2s ease-in-out infinite', flexShrink:0 }}/>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:'0.6rem', color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.12em' }}>canlı</span>
        </div>
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
          const efekt = CARD_STYLES[i % CARD_STYLES.length];
          return (
            <Link key={oda.id} href={`/oda/${oda.id}`} style={{ textDecoration:'none' }}>
              <div className={`oda-card card-${efekt}`}>
                <div className="card-emoji">{oda.emoji}</div>
                <div className="card-name">{oda.isim}</div>
                <div className="card-badge">{count} oyun 🎮</div>
              </div>
            </Link>
          );
        })}
      </div>

    </main>
  );
}
