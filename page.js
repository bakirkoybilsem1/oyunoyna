'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0f0c29, #302b63, #24243e)',
    fontFamily: "'Fredoka One', cursive",
    color: 'white',
  },
  header: {
    padding: '20px 28px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  h1: { margin: 0, fontSize: '1.8rem', color: 'white' },
  tabs: { display: 'flex', gap: 8, padding: '16px 28px' },
  card: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16, padding: '16px 20px',
    display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10,
  },
  input: {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: 'white', fontSize: '1rem',
    fontFamily: "'Fredoka One', cursive",
    outline: 'none', boxSizing: 'border-box',
  },
  label: { display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 6 },
  btnPrimary: {
    width: '100%', padding: '14px', borderRadius: 14,
    border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
    color: 'white', fontSize: '1.1rem',
    fontFamily: "'Fredoka One', cursive",
    fontWeight: 700, marginTop: 8,
    boxShadow: '0 6px 24px rgba(240,147,251,0.35)',
    transition: 'opacity 0.2s',
  },
  btnTab: (active) => ({
    padding: '8px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
    fontFamily: "'Fredoka One', cursive", fontWeight: 700, fontSize: '0.9rem',
    background: active ? 'linear-gradient(135deg, #f093fb, #f5576c)' : 'rgba(255,255,255,0.1)',
    color: active ? 'white' : 'rgba(255,255,255,0.55)',
    transition: 'all 0.2s',
  }),
};

export default function AdminPage() {
  const [oyunlar, setOyunlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [tab, setTab] = useState('list');
  const [uploadType, setUploadType] = useState('file'); // file | paste | url
  const fileRef = useRef();

  const [form, setForm] = useState({
    isim: '', slug: '', renk: '#33ccff',
    html_kodu: '', game_url: '',
  });

  const fetchOyunlar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('oyunlar')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setOyunlar(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOyunlar(); }, []);

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: '', ok: true }), 4000);
  };

  const handleIsimChange = (e) => {
    const isim = e.target.value;
    setForm(f => ({ ...f, isim, slug: slugify(isim) }));
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.match(/\.(html|htm)$/i)) {
      showMsg('❌ Sadece .html veya .htm dosyası yükleyebilirsin!', false);
      return;
    }
    const text = await file.text();
    setForm(f => ({ ...f, html_kodu: text }));
    showMsg(`✅ "${file.name}" yüklendi (${Math.round(text.length / 1024)} KB)`);
  };

  const handleSave = async () => {
    if (!form.isim.trim()) { showMsg('❌ Oyun adı zorunlu!', false); return; }

    let html_kodu = null;
    if (uploadType === 'file' || uploadType === 'paste') {
      if (!form.html_kodu.trim()) { showMsg('❌ HTML içeriği gerekli!', false); return; }
      html_kodu = form.html_kodu;
    } else {
      if (!form.game_url.trim()) { showMsg('❌ URL gerekli!', false); return; }
      html_kodu = form.game_url; // URL olarak sakla
    }

    setSaving(true);
    const { error } = await supabase.from('oyunlar').insert([{
      isim: form.isim.trim(),
      slug: form.slug || slugify(form.isim),
      renk: form.renk || '#33ccff',
      html_kodu,
      is_active: true,
    }]);

    if (error) {
      showMsg(`❌ Hata: ${error.message}`, false);
    } else {
      showMsg('✅ Oyun başarıyla eklendi!');
      setForm({ isim: '', slug: '', renk: '#33ccff', html_kodu: '', game_url: '' });
      if (fileRef.current) fileRef.current.value = '';
      await fetchOyunlar();
      setTimeout(() => setTab('list'), 1200);
    }
    setSaving(false);
  };

  const handleDelete = async (id, isim) => {
    if (!confirm(`"${isim}" silinsin mi?`)) return;
    const { error } = await supabase.from('oyunlar').delete().eq('id', id);
    if (error) showMsg(`❌ Silinemedi: ${error.message}`, false);
    else { showMsg(`✅ "${isim}" silindi.`); fetchOyunlar(); }
  };

  const toggleActive = async (id, current) => {
    const { error } = await supabase.from('oyunlar').update({ is_active: !current }).eq('id', id);
    if (!error) fetchOyunlar();
  };

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={S.header}>
        <h1 style={S.h1}>🎮 Admin Panel</h1>
        <a href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Siteye Dön
        </a>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        <button style={S.btnTab(tab === 'list')} onClick={() => setTab('list')}>📋 Oyunlar ({oyunlar.length})</button>
        <button style={S.btnTab(tab === 'add')} onClick={() => setTab('add')}>➕ Yeni Oyun</button>
      </div>

      {/* Mesaj */}
      {msg.text && (
        <div style={{
          margin: '0 28px 12px',
          padding: '12px 16px', borderRadius: 12, fontSize: '0.9rem',
          background: msg.ok ? 'rgba(79,209,197,0.15)' : 'rgba(245,87,108,0.15)',
          border: `1px solid ${msg.ok ? 'rgba(79,209,197,0.4)' : 'rgba(245,87,108,0.4)'}`,
          color: msg.ok ? '#4fd1c5' : '#f5576c',
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ padding: '0 28px 40px' }}>

        {/* LİSTE */}
        {tab === 'list' && (
          <div>
            {loading ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingTop: 40 }}>Yükleniyor...</p>
            ) : oyunlar.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 40 }}>Henüz oyun yok.</p>
            ) : (
              oyunlar.map(o => (
                <div key={o.id} style={S.card}>
                  {/* Renk kutusu */}
                  <div style={{ width: 14, height: 40, borderRadius: 4, background: o.renk || '#33ccff', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {o.isim}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>/oyun/{o.slug}</div>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', marginTop: 2 }}>
                      {o.html_kodu
                        ? o.html_kodu.startsWith('http') || o.html_kodu.startsWith('<iframe')
                          ? '🔗 URL oyunu'
                          : `📄 HTML (${Math.round(o.html_kodu.length / 1024)}KB)`
                        : '—'}
                    </div>
                  </div>
                  {/* Butonlar */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => toggleActive(o.id, o.is_active)}
                      style={{
                        padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: o.is_active ? 'rgba(79,209,197,0.2)' : 'rgba(255,255,255,0.1)',
                        color: o.is_active ? '#4fd1c5' : 'rgba(255,255,255,0.4)', fontSize: '0.8rem',
                        fontFamily: "'Fredoka One', cursive",
                      }}>
                      {o.is_active ? '✅' : '❌'}
                    </button>
                    <a href={`/oyun/${o.slug}`} target="_blank" rel="noreferrer"
                      style={{
                        padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
                        background: 'rgba(79,209,197,0.15)', color: '#4fd1c5', fontSize: '0.8rem',
                        border: '1px solid rgba(79,209,197,0.25)',
                      }}>
                      ▶
                    </a>
                    <button
                      onClick={() => handleDelete(o.id, o.isim)}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(245,87,108,0.3)',
                        background: 'rgba(245,87,108,0.15)', color: '#f5576c', cursor: 'pointer',
                        fontSize: '0.8rem', fontFamily: "'Fredoka One', cursive",
                      }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* EKLE */}
        {tab === 'add' && (
          <div style={{ maxWidth: 520 }}>

            {/* İsim */}
            <div style={{ marginBottom: 18 }}>
              <label style={S.label}>Oyun Adı *</label>
              <input style={S.input} value={form.isim} onChange={handleIsimChange} placeholder="örn: Araba Yarışı" />
            </div>

            {/* Slug */}
            <div style={{ marginBottom: 18 }}>
              <label style={S.label}>URL Slug</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6,
                padding: '12px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>/oyun/</span>
                <input
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'white',
                    outline: 'none', fontFamily: "'Fredoka One', cursive", fontSize: '0.9rem' }}
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                />
              </div>
            </div>

            {/* Renk */}
            <div style={{ marginBottom: 18 }}>
              <label style={S.label}>Renk</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="color" value={form.renk}
                  onChange={e => setForm(f => ({ ...f, renk: e.target.value }))}
                  style={{ width: 48, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{form.renk}</span>
              </div>
            </div>

            {/* Upload tipi */}
            <div style={{ marginBottom: 18 }}>
              <label style={S.label}>Oyun Tipi</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['file','📁 HTML Dosyası'],['paste','📝 Yapıştır'],['url','🔗 URL']].map(([val, lbl]) => (
                  <button key={val}
                    onClick={() => setUploadType(val)}
                    style={S.btnTab(uploadType === val)}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Dosya yükleme */}
            {uploadType === 'file' && (
              <div style={{ marginBottom: 18 }}>
                <label style={S.label}>HTML Dosyası</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    padding: '36px 20px', borderRadius: 16, textAlign: 'center',
                    border: '2px dashed rgba(255,255,255,0.2)',
                    background: form.html_kodu ? 'rgba(79,209,197,0.08)' : 'rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                  }}>
                  {form.html_kodu ? (
                    <>
                      <div style={{ fontSize: '2.5rem' }}>✅</div>
                      <div style={{ color: '#4fd1c5', marginTop: 8 }}>
                        Dosya yüklendi ({Math.round(form.html_kodu.length / 1024)} KB)
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: 4 }}>
                        Değiştirmek için tekrar tıkla
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '2.5rem' }}>📁</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>Tıkla veya sürükle bırak</div>
                      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', marginTop: 4 }}>.html / .htm</div>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".html,.htm" onChange={handleFile} style={{ display: 'none' }} />
              </div>
            )}

            {/* HTML yapıştır */}
            {uploadType === 'paste' && (
              <div style={{ marginBottom: 18 }}>
                <label style={S.label}>HTML Kodu</label>
                <textarea
                  value={form.html_kodu}
                  onChange={e => setForm(f => ({ ...f, html_kodu: e.target.value }))}
                  placeholder={'<!DOCTYPE html>\n<html>\n  <body>...\n  </body>\n</html>'}
                  rows={10}
                  style={{
                    ...S.input,
                    fontFamily: 'monospace', fontSize: '0.8rem',
                    resize: 'vertical', color: '#a8ff78',
                  }}
                />
              </div>
            )}

            {/* URL */}
            {uploadType === 'url' && (
              <div style={{ marginBottom: 18 }}>
                <label style={S.label}>Oyun URL'si</label>
                <input
                  style={S.input}
                  value={form.game_url}
                  onChange={e => setForm(f => ({ ...f, game_url: e.target.value }))}
                  placeholder="https://example.com/oyun"
                />
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{ ...S.btnPrimary, opacity: saving ? 0.6 : 1 }}>
              {saving ? '⏳ Kaydediliyor...' : '✅ Oyunu Kaydet'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
