return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      background: '#0f0c29', // Tırnak kapatıldı
      fontFamily: "'Fredoka One', cursive" 
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />
      
      {/* Üst Bar */}
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 700 }}>
          ← Geri Dön
        </Link>
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>{oyun.isim}</h1>
        <div style={{ width: 80 }}></div> {/* Dengeleyici */}
      </header>

      {/* Oyun Alanı */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {kaynakUrl ? (
          <iframe
            src={kaynakUrl}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              background: 'white'
            }}
            allowFullScreen
          />
        ) : (
          <div style={{ color: 'white', textAlign: 'center' }}>
            <p>Oyun içeriği yüklenemedi (Geçersiz URL).</p>
          </div>
        )}
      </div>
    </div>
  );
}
