return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0f0c29,#302b63)', fontFamily:"'Fredoka One',cursive", color:'white' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />

      <div style={{ padding:'20px 28px', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1 style={{ margin:0, fontSize:'1.8rem' }}>🎮 Admin Panel</h1>
        <a href="/" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← Siteye Dön</a>
      </div>

      <div style={{ display:'flex', gap:8, padding:'16px 28px' }}>
        <button style={btnTab(tab==='list')} onClick={()=>setTab('list')}>📋 Oyunlar ({oyunlar.length})</button>
        <button style={btnTab(tab==='add')} onClick={()=>setTab('add')}>➕ Yeni Oyun</button>
      </div>

      {msg && (
        <div style={{ margin:'0 28px 12px', padding:'12px 16px', borderRadius:12, background:ok?'rgba(79,209,197,0.15)':'rgba(245,87,108,0.15)', color:ok?'#4fd1c5':'#f5576c', border:`1px solid ${ok?'rgba(79,209,197,0.4)':'rgba(245,87,108,0.4)'}` }}>
          {msg}
        </div>
      )}

      <div style={{ padding: '0 28px 40px' }}>
        {tab === 'list' ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {oyunlar.map(o => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: o.renk }}></div>
                  <span style={{ fontSize: '1.1rem' }}>{o.isim}</span>
                  <code style={{ fontSize: '0.8rem', opacity: 0.5 }}>/{o.slug}</code>
                </div>
                <button onClick={() => handleDelete(o.id, o.isim)} style={{ background: 'none', border: 'none', color: '#f5576c', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
              </div>
            ))}
            {oyunlar.length === 0 && <p style={{ opacity: 0.5 }}>Henüz oyun eklenmemiş.</p>}
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: 24, borderRadius: 20, maxWidth: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Oyun Adı</label>
              <input style={inp} value={form.isim} onChange={e => setForm({ ...form, isim: e.target.value })} placeholder="Örn: Balon Patlatma" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Yükleme Tipi</label>
              <select style={inp} value={uploadType} onChange={e => setUploadType(e.target.value)}>
                <option value="file">HTML Dosyası Yükle</option>
                <option value="paste">HTML Kodu Yapıştır</option>
                <option value="url">Oyun URL'si (Iframe)</option>
              </select>
            </div>

            {uploadType === 'file' && (
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>HTML Dosyası Seç</label>
                <input type="file" ref={fileRef} onChange={handleFile} style={inp} accept=".html,.htm" />
              </div>
            )}

            {uploadType === 'paste' && (
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>HTML İçeriği</label>
                <textarea style={{ ...inp, height: 120, resize: 'vertical' }} value={form.html_kodu} onChange={e => setForm({ ...form, html_kodu: e.target.value })} placeholder="<html>...</html>" />
              </div>
            )}

            {uploadType === 'url' && (
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Oyun Linki (SRC URL)</label>
                <input style={inp} value={form.game_url} onChange={e => setForm({ ...form, game_url: e.target.value })} placeholder="https://..." />
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Renk Teması</label>
              <input type="color" style={{ ...inp, height: 50, padding: 4 }} value={form.renk} onChange={e => setForm({ ...form, renk: e.target.value })} />
            </div>

            <button 
              disabled={saving} 
              onClick={handleSave} 
              style={{ ...btnTab(true), width: '100%', padding: 16, fontSize: '1.1rem', marginTop: 10 }}
            >
              {saving ? '⏳ Kaydediliyor...' : '🚀 Oyunu Yayınla'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
