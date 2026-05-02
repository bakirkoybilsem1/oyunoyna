'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

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

const PLANET_STYLES = [
  { color: '#ffe600', shadow: '0 0 20px #ffe600, 0 0 50px rgba(255,230,0,0.4)', size: 80 },
  { color: '#00ff64', shadow: '0 0 20px #00ff64, 0 0 50px rgba(0,255,100,0.35)', size: 70 },
  { color: '#64c8ff', shadow: '0 0 20px #64c8ff, 0 0 50px rgba(0,180,255,0.35)', size: 66 },
  { color: '#ff6600', shadow: '0 0 20px #ff6600, 0 0 50px rgba(255,100,0,0.4)', size: 62 },
  { color: '#ff2244', shadow: '0 0 20px #ff2244, 0 0 50px rgba(255,0,60,0.35)', size: 68 },
];

const ORBIT_R = 160;

export default function Home() {
  const [odalar, setOdalar] = useState([]);
  const [tumOyunlar, setTumOyunlar] = useState([]);
  const [oyunSayilari, setOyunSayilari] = useState({});
  const [ziyaretSayisi, setZiyaretSayisi] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [sunHovered, setSunHovered] = useState(false);
  const [sunClicked, setSunClicked] = useState(false);
  const lastOyunRef = useRef(null);

  const stars = useRef(Array.from({ length: 60 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 80,
    s: Math.random() * 1.5 + 0.5,
    d: Math.random() * 3 + 2,
    delay: Math.random() * 4,
  }))).current;

  const t = useSunCycle();
  const { sky1, sky2, sun, horizon } = getSkyColors(t);
  const sunY = Math.sin(t * Math.PI) * 70;
  const sunX = 8 + t * 84;
  const isNight = t < 0.12 || t > 0.88;
  const starOpacity = t < 0.15 ? (0.15 - t) / 0.15 : t > 0.85 ? (t - 0.85) / 0.15 : 0;
  const router = useRouter();

  useEffect(() => {
    async function sayaciArtir() {
      const { data, error } = await supabase
        .from('ziyaret_sayaci').select('sayi').eq('id', 1).single();
      if (error) return;
      const yeniSayi = (data?.sayi ?? 0) + 1;
      const { error: updateError } = await supabase
        .from('ziyaret_sayaci').update({ sayi: yeniSayi }).eq('id', 1);
      setZiyaretSayisi(updateError ? data?.sayi ?? 0 : yeniSayi);
    }
    sayaciArtir();
  }, []);

  useEffect(() => {
    supabase.from('odalar').select('*').eq('is_active', true).order('sira').then(({ data }) => {
      if (data) {
        setOdalar(data);
        data.forEach(oda => {
          supabase.from('oyunlar').select('id', { count: 'exact' })
            .eq('oda_id', oda.id).eq('is_active', true)
            .then(({ count }) => {
              setOyunSayilari(prev => ({ ...prev, [oda.id]: count || 0 }));
            });
        });
      }
    });

    supabase.from('oyunlar').select('id, slug').eq('is_active', true).then(({ data }) => {
      if (data) setTumOyunlar(data);
    });
  }, []);

  function rastgeleOyunAc() {
    if (tumOyunlar.length === 0) return;

    setSunClicked(true);
    setTimeout(() => setSunClicked(false), 300);

    let secilen;
    if (tumOyunlar.length === 1) {
      secilen = tumOyunlar[0];
    } else {
      const diger = tumOyunlar.filter(o => o.id !== lastOyunRef.current);
      secilen = diger[Math.floor(Math.random() * diger.length)];
    }

    lastOyunRef.current = secilen.id;
    router.push(`/oyun/${secilen.slug}`);
  }

  return (
    <main style={{
      minHeight: '100vh', overflow: 'hidden', position: 'relative',
      fontFamily: "'Fredoka One', cursive",
      background: `linear-gradient(180deg, ${sky1} 0%, ${sky2} 60%, ${horizon} 100%)`,
      transition: 'background 2s ease',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Syne:wght@800&family=Space+Grotesk:wght@500&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes float-0 { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-8px)} }
        @keyframes float-1 { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-6px)} }
        @keyframes float-2 { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-9px)} }
        @keyframes float-3 { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-5px)} }
        @keyframes float-4 { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-7px)} }
        @keyframes star-twinkle { 0%,100%{opacity:0.8} 50%{opacity:0.1} }
        @keyframes live-ping { 0%,100%{box-shadow:0 0 0 0 rgba(134,239,172,0.8)} 50%{box-shadow:0 0 0 5px rgba(134,239,172,0)} }
        @keyframes num-pop { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        @keyframes sun-pulse { 0%,100%{box-shadow:0 0 40px rgba(255,200,0,0.7),0 0 80px rgba(255,150,0,0.35)} 50%{box-shadow:0 0 60px rgba(255,220,0,1),0 0 120px rgba(255,180,0,0.6)} }
        @keyframes sun-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes gelisiguzel-bounce { 0%,100%{transform:translateX(-50%) translateY(0) rotate(-4deg)} 50%{transform:translateX(-50%) translateY(-3px) rotate(4deg)} }
      `}</style>

      {/* Yıldızlar */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        {stars.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.s} fill="white"
            opacity={starOpacity * 0.9}
            style={{ animation: `star-twinkle ${s.d}s ease-in-out infinite`, animationDelay: `${s.delay}s` }}
          />
        ))}
      </svg>

      {/* Güneş / Ay (arka plan animasyonu) */}
      <div style={{
        position: 'absolute', left: `${sunX}%`, bottom: `${sunY}%`,
        transform: 'translate(-50%, 50%)', pointerEvents: 'none', zIndex: 2,
        transition: 'left 0.5s linear, bottom 0.5s linear',
      }}>
        <div style={{
          width: isNight ? 50 : 64, height: isNight ? 50 : 64, borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle at 38% 35%, #fffde7, #fff9c4)'
            : `radial-gradient(circle at 38% 35%, #ffffff, ${sun}, #ff8c00)`,
          boxShadow: isNight
            ? '0 0 20px rgba(255,255,200,0.4)'
            : `0 0 40px ${sun}, 0 0 80px ${sun}88`,
        }} />
      </div>

      {/* Dağlar */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', zIndex: 3 }}
        viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path d="M0,220 L0,130 Q120,60 240,110 Q360,160 480,90 Q600,20 720,100 Q840,170 960,85 Q1080,10 1200,95 Q1320,160 1440,110 L1440,220 Z" fill="#0a0a1a" opacity="0.7" />
        <path d="M0,220 L0,165 Q180,110 360,145 Q540,175 720,130 Q900,85 1080,140 Q1260,180 1440,150 L1440,220 Z" fill="#050510" opacity="0.9" />
      </svg>

      {/* Başlık */}
      <header style={{ textAlign: 'center', padding: '28px 16px 0', position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontSize: 'clamp(1rem, 2.5vw, 2rem)', color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.8)', margin: 0 }}>
          🎈 Bakırköy BİLSEM
        </h1>
        <h2 style={{ fontSize: 'clamp(0.75rem, 1.8vw, 1.2rem)', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontWeight: 400, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
          Dijital Oyun Tasarlama Atölyesi
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', marginTop: 6 }}>✨ Bir gezegen seç, oyunları keşfet!</p>
      </header>

      {/* Ziyaret Sayacı */}
      <div style={{
        position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)',
        zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%', overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.3)', background: '#0a0a0a',
        }}>
          <video autoPlay loop muted playsInline
            src="https://ppbmdnnnlleoptdinzsn.supabase.co/storage/v1/object/public/suppilami.mp4/suppilami.mp4"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          />
        </div>
        <span style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.4rem',
          color: '#fff', lineHeight: 1, letterSpacing: '-1px',
          textShadow: '0 2px 10px rgba(0,0,0,0.4)',
          animation: ziyaretSayisi !== null ? 'num-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
        }}>
          {ziyaretSayisi === null
            ? <span style={{ opacity: 0.3, fontSize: '1rem' }}>…</span>
            : ziyaretSayisi.toLocaleString('tr-TR')
          }
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ziyaret</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55rem' }}>·</span>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#86efac', display: 'inline-block', animation: 'live-ping 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>canlı</span>
        </div>
      </div>

      {/* GEZEGEN SİSTEMİ */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', height: 'calc(100vh - 140px)',
      }}>
        {/* Yörünge halkası */}
        <div style={{
          position: 'absolute',
          width: ORBIT_R * 2, height: ORBIT_R * 2,
          borderRadius: '50%',
          border: '1px dashed rgba(255,255,255,0.12)',
          pointerEvents: 'none',
        }} />

        {/* MERKEZDEKİ GELİŞİGÜZEL GÜNEŞ */}
        <div
          onClick={rastgeleOyunAc}
          onMouseEnter={() => setSunHovered(true)}
          onMouseLeave={() => setSunHovered(false)}
          style={{
            position: 'absolute',
            cursor: tumOyunlar.length > 0 ? 'pointer' : 'default',
            zIndex: 15,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            transform: sunClicked ? 'scale(0.9)' : sunHovered ? 'scale(1.12)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #fffde7, #ffcc02, #ff8c00)',
            boxShadow: sunHovered
              ? '0 0 30px rgba(255,220,0,1), 0 0 70px rgba(255,180,0,0.7), 0 0 0 4px rgba(255,255,200,0.3)'
              : '0 0 24px rgba(255,200,0,0.8), 0 0 50px rgba(255,150,0,0.4)',
            animation: 'sun-pulse 3s ease-in-out infinite',
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute', inset: -8, borderRadius: '50%',
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,220,0,0.15) 30deg, transparent 60deg, rgba(255,200,0,0.1) 90deg, transparent 120deg, rgba(255,220,0,0.15) 150deg, transparent 180deg, rgba(255,200,0,0.1) 210deg, transparent 240deg, rgba(255,220,0,0.15) 270deg, transparent 300deg, rgba(255,200,0,0.1) 330deg, transparent 360deg)',
              animation: 'sun-spin 8s linear infinite',
            }} />
          </div>

          <div style={{
            position: 'absolute',
            bottom: -32,
            left: '50%',
            animation: 'gelisiguzel-bounce 2s ease-in-out infinite',
            whiteSpace: 'nowrap',
          }}>
            <div style={{
              background: sunHovered
                ? 'linear-gradient(135deg, #ffcc02, #ff8c00)'
                : 'rgba(255,200,0,0.15)',
              border: '1.5px solid rgba(255,200,0,0.6)',
              borderRadius: 20,
              padding: '3px 10px',
              color: sunHovered ? '#3d1a00' : '#ffdd44',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textShadow: sunHovered ? 'none' : '0 0 8px rgba(255,200,0,0.8)',
              transition: 'all 0.2s',
              backdropFilter: 'blur(4px)',
            }}>
              🎲 GELİŞİGÜZEL
            </div>
          </div>
        </div>

        {/* Gezegenler */}
        {odalar.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', position: 'absolute', top: '60%' }}>
            Gezegenler yükleniyor... 🪐
          </p>
        )}

        {odalar.map((oda, i) => {
          const n = odalar.length;
          const angleDeg = (360 / n) * i - 90;
          const angleRad = angleDeg * Math.PI / 180;
          const cx = Math.cos(angleRad) * ORBIT_R;
          const cy = Math.sin(angleRad) * ORBIT_R;
          const style = PLANET_STYLES[i % PLANET_STYLES.length];
          const count = oyunSayilari[oda.id] || 0;
          const isHovered = hoveredId === oda.id;

          return (
            <div
              key={oda.id}
              onClick={() => router.push(`/oda/${oda.id}`)}
              onMouseEnter={() => setHoveredId(oda.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'absolute',
                left: '50%', top: '50%',
                marginLeft: cx, marginTop: cy,
                transform: `translate(-50%, -50%) scale(${isHovered ? 1.2 : 1})`,
                animation: `float-${i % 5} ${3.2 + i * 0.4}s ease-in-out infinite`,
                animationDelay: `${i * 0.6}s`,
                cursor: 'pointer',
                zIndex: isHovered ? 20 : 10,
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <div style={{
                width: style.size, height: style.size, borderRadius: '50%',
                background: `
                  radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3), transparent 50%),
                  radial-gradient(circle at 65% 70%, rgba(0,0,0,0.25), transparent 50%),
                  ${style.color}
                `,
                boxShadow: isHovered
                  ? `${style.shadow}, 0 0 0 3px rgba(255,255,255,0.3)`
                  : style.shadow,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: style.size * 0.42,
                transition: 'box-shadow 0.2s',
              }}>
                {oda.emoji}
              </div>

              <div style={{
                position: 'absolute',
                bottom: -(isHovered ? 44 : 38),
                left: '50%', transform: 'translateX(-50%)',
                whiteSpace: 'nowrap', textAlign: 'center',
                transition: 'bottom 0.2s',
              }}>
                <div style={{
                  color: '#fff', fontSize: '0.78rem', fontWeight: 700,
                  textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                }}>
                  {oda.isim}
                </div>
                <div style={{
                  color: style.color, fontSize: '0.65rem',
                  textShadow: `0 0 10px ${style.color}`,
                  marginTop: 2,
                }}>
                  {count} oyun 🎮
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
