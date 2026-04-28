{(isUrl ? oyun.html_kodu : src) ? (
  
    href={isUrl ? oyun.html_kodu : src}
    target="_blank"
    rel="noreferrer"
    style={{ color:'white', fontWeight:700, fontSize:'1.2rem', textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}
    onMouseEnter={e => e.currentTarget.style.opacity='0.7'}
    onMouseLeave={e => e.currentTarget.style.opacity='1'}
  >
    🎮 {oyun.isim} <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.4)' }}>↗</span>
  </a>
) : (
  <span style={{ color:'white', fontWeight:700, fontSize:'1.2rem' }}>🎮 {oyun.isim}</span>
)}
