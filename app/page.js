{/* ── ZİYARET SAYACI ── */}
<style>{`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Space+Grotesk:wght@500&display=swap');
  @keyframes live-ping {
    0%,100% { box-shadow: 0 0 0 0 rgba(134,239,172,0.8); }
    50%      { box-shadow: 0 0 0 6px rgba(134,239,172,0); }
  }
  @keyframes num-pop {
    from { opacity:0; transform:scale(0.5); }
    to   { opacity:1; transform:scale(1); }
  }
`}</style>

<div style={{
  position: 'fixed',
  left: 16,
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
}}>

  {/* Şuppilami video — daire */}
  <div style={{
    width: 72,
    height: 72,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.35)',
    background: '#0a0a0a',
    flexShrink: 0,
  }}>
    <video
      autoPlay loop muted playsInline
      src="/suppilami.mp4"
      style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }}
    />
  </div>

  {/* Sayı */}
  <span style={{
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: '1.6rem',
    color: '#fff',
    lineHeight: 1,
    letterSpacing: '-1px',
    textShadow: '0 2px 10px rgba(0,0,0,0.35)',
    animation: ziyaretSayisi !== null ? 'num-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
  }}>
    {ziyaretSayisi === null
      ? <span style={{ opacity:0.3, fontSize:'1rem' }}>…</span>
      : ziyaretSayisi.toLocaleString('tr-TR')
    }
  </span>

  {/* ziyaret • canlı */}
  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
    <span style={{
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 500,
      fontSize: '0.6rem',
      color: 'rgba(255,255,255,0.55)',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
    }}>ziyaret</span>

    <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.6rem' }}>·</span>

    <span style={{
      width: 6, height: 6,
      borderRadius: '50%',
      background: '#86efac',
      display: 'inline-block',
      animation: 'live-ping 2s ease-in-out infinite',
      flexShrink: 0,
    }}/>

    <span style={{
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 500,
      fontSize: '0.6rem',
      color: 'rgba(255,255,255,0.55)',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
    }}>canlı</span>
  </div>

</div>
