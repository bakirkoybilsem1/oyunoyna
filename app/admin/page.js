'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const GITHUB_OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER || 'bakirkoybilsem1';
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || 'oyun-merkezi';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // server-side only — use API route

const ODALAR = [
  { id: 'e5017a3d-2a05-44f6-a747-c057dfa574b2', isim: 'Hayal Odası',  ikon: '🌊' },
  { id: 'd470b99e-9dba-4fca-8347-c87c171a5abe', isim: 'Merak Odası',  ikon: '🔭' },
  { id: '34ea9032-80a6-4fb6-adf1-b3ae9497b942', isim: 'Gelecek',      ikon: '🚀' },
  { id: '73ee5136-95e2-4c15-93e4-2f8b50850499', isim: 'Özgün',        ikon: '🏄' },
  { id: '8076d782-9346-43dd-bf03-9a3240263abc', isim: 'Yaratıcı',     ikon: '🎋' },
];

function slugify(t) {
  return t.toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

const EMPTY_FORM = {
  isim: '', renk: '#4ECDC4', oda_id: '',
  inputType: 'file', // 'file' | 'paste' | 'url'
  htmlKodu: '', gameUrl: '',
};

export default function Admin() {
  const [tab, setTab]         = useState('list'); // 'list' | 'add' | 'edit'
  const [oyunlar, setOyunlar] = useState([]);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]         = useState({ text: '', ok: true });
  const [filter, setFilter]   = useState('');
  const fileRef = useRef();

  /* ── helpers ─────────────────────────────────── */
  const toast = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: '', ok: true }), 4000);
  };

  const fetchOyunlar = async () => {
    const { data } = await supabase
      .from('oyunlar').select('*').order('created_at', { ascending: false });
    setOyunlar(data || []);
  };
  useEffect(() => { fetchOyunlar(); }, []);

  /* ── file reader ─────────────────────────────── */
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    setForm(f => ({ ...f, htmlKodu: text }));
    toast(`✅ ${file.name} yüklendi`);
  };

  /* ── GitHub upload ───────────────────────────── */
  const uploadToGitHub = async () => {
    if (!form.isim.trim()) { toast('❌ Önce oyun adını gir', false); return; }
    if (!form.htmlKodu.trim()) { toast('❌ HTML kodu boş', false); return; }

    setUploading(true);
    try {
      const slug = slugify(form.isim);
      const path = `${slug}/index.html`;
      const content = btoa(unescape(encodeURIComponent(form.htmlKodu)));

      // Check if file exists (to get SHA for update)
      let sha = undefined;
      const checkRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
        { headers: { Authorization: `token ${form.ghToken}`, Accept: 'application/vnd.github.v3+json' } }
      );
      if (checkRes.ok) {
        const existing = await checkRes.json();
        sha = existing.sha;
      }

      const body = {
        message: `Oyun eklendi: ${form.isim}`,
        content,
        ...(sha ? { sha } : {}),
      };

      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${form.ghToken}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'GitHub hatası');
      }

      const gameUrl = `https://${GITHUB_OWNER}.github.io/${GITHUB_REPO}/${slug}/`;
      setForm(f => ({ ...f, gameUrl }));
      toast(`✅ GitHub'a yüklendi! Link oluşturuldu.`);
    } catch (err) {
      toast(`❌ ${err.message}`, false);
    }
    setUploading(false);
  };

  /* ── save to Supabase ────────────────────────── */
  const handleSave = async () => {
    if (!form.isim.trim()) { toast('❌ Oyun adı zorunlu!', false); return; }
    const finalUrl = form.inputType === 'url' ? form.gameUrl : (form.gameUrl || null);
    const finalHtml = form.inputType !== 'url' ? form.htmlKodu : null;
    const slug = slugify(form.isim);

    setSaving(true);
    let error;
    if (editId) {
      ({ error } = await supabase.from('oyunlar').update({
        isim: form.isim.trim(),
        renk: form.renk,
        oda_id: form.oda_id || null,
        html_kodu: finalHtml,
        url: finalUrl,
        slug,
      }).eq('id', editId));
    } else {
      ({ error } = await supabase.from('oyunlar').insert([{
        isim: form.isim.trim(),
        renk: form.renk,
        oda_id: form.oda_id || null,
        html_kodu: finalHtml,
        url: finalUrl,
        slug,
        is_active: true,
      }]));
    }

    if (error) toast(`❌ ${error.message}`, false);
    else {
      toast(editId ? '✅ Güncellendi!' : '✅ Oyun eklendi!');
      setForm(EMPTY_FORM);
      setEditId(null);
      setTab('list');
      fetchOyunlar();
    }
    setSaving(false);
  };

  /* ── edit ────────────────────────────────────── */
  const startEdit = (o) => {
    setForm({
      ...EMPTY_FORM,
      isim: o.isim,
      renk: o.renk || '#4ECDC4',
      oda_id: o.oda_id || '',
      inputType: o.url ? 'url' : 'paste',
      htmlKodu: o.html_kodu || '',
      gameUrl: o.url || '',
    });
    setEditId(o.id);
    setTab('add');
  };

  /* ── toggle active ───────────────────────────── */
  const toggleActive = async (o) => {
    await supabase.from('oyunlar').update({ is_active: !o.is_active }).eq('id', o.id);
    fetchOyunlar();
  };

  /* ── delete ─────────────────────────────────── */
  const handleDelete = async (id, isim) => {
    if (!confirm(`"${isim}" silinsin mi?`)) return;
    await supabase.from('oyunlar').delete().eq('id', id);
    fetchOyunlar();
  };

  /* ── filtered list ───────────────────────────── */
  const filtered = oyunlar.filter(o =>
    o.isim?.toLowerCase().includes(filter.toLowerCase())
  );

  /* ── styles ─────────────────────────────────── */
  const s = {
    page:    { minHeight: '100vh', background: '#0a0a14', color: '#e8e8f0', fontFamily: "'Segoe UI', sans-serif", padding: 24 },
    header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
    title:   { fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 },
    back:    { color: '#888', textDecoration: 'none', fontSize: 14 },
    tabs:    { display: 'flex', gap: 8, marginBottom: 24 },
    tab:     (a) => ({ padding: '9px 22px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: a ? '#f5576c' : '#1e1e2e', color: a ? '#fff' : '#aaa', transition: 'all .2s' }),
    toast:   (ok) => ({ padding: '10px 16px', borderRadius: 10, marginBottom: 16, background: ok ? '#0d2e1f' : '#2e0d0d', border: `1px solid ${ok ? '#1a5c35' : '#5c1a1a'}`, color: ok ? '#4cde8a' : '#de4c4c', fontSize: 14 }),
    card:    { background: '#13131f', border: '1px solid #222', borderRadius: 12, padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 },
    dot:     (renk) => ({ width: 12, height: 12, borderRadius: '50%', background: renk, flexShrink: 0 }),
    name:    { flex: 1, fontWeight: 600, fontSize: 15 },
    badge:   (active) => ({ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: active ? '#0d2e1f' : '#2e1a00', color: active ? '#4cde8a' : '#f0a030', fontWeight: 600 }),
    odaBadge: { fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#1a1a2e', color: '#8888cc', fontWeight: 600 },
    actions: { display: 'flex', gap: 6 },
    iconBtn: (c) => ({ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: c, padding: 4, borderRadius: 6, transition: 'background .15s' }),
    form:    { maxWidth: 560 },
    lbl:     { display: 'block', fontSize: 13, color: '#888', marginBottom: 6, marginTop: 16, fontWeight: 600, letterSpacing: '.03em' },
    inp:     { width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid #2a2a3e', background: '#13131f', color: '#e8e8f0', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
    textarea:{ width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid #2a2a3e', background: '#13131f', color: '#e8e8f0', fontSize: 13, boxSizing: 'border-box', outline: 'none', minHeight: 160, fontFamily: 'monospace', resize: 'vertical' },
    btn:     (c) => ({ width: '100%', padding: '12px', background: c, color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 10, transition: 'opacity .2s' }),
    odaGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 6 },
    odaCard: (sel) => ({ padding: '12px 8px', borderRadius: 10, border: `2px solid ${sel ? '#f5576c' : '#2a2a3e'}`, background: sel ? '#2a0d14' : '#13131f', cursor: 'pointer', textAlign: 'center', transition: 'all .2s' }),
    odaIcon: { fontSize: 22 },
    odaName: { fontSize: 12, marginTop: 4, color: '#ccc', fontWeight: 600 },
    search:  { width: '100%', padding: '10px 14px', borderRadius: 9, border: '1px solid #2a2a3e', background: '#13131f', color: '#e8e8f0', fontSize: 14, boxSizing: 'border-box', marginBottom: 16 },
    typeRow: { display: 'flex', gap: 8, marginTop: 6 },
    typeBtn: (a) => ({ flex: 1, padding: '9px 0', borderRadius: 8, border: `2px solid ${a ? '#f5576c' : '#2a2a3e'}`, background: a ? '#2a0d14' : '#13131f', color: a ? '#f5576c' : '#888', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .2s' }),
    ghRow:   { display: 'flex', gap: 8, alignItems: 'flex-end' },
    ghBtn:   { padding: '11px 18px', borderRadius: 9, border: 'none', background: '#238636', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13 },
  };

  const odaAdi = (id) => ODALAR.find(o => o.id === id)?.isim || '—';
  const odaIcon = (id) => ODALAR.find(o => o.id === id)?.ikon || '';

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>🎮 Admin Paneli</h1>
        <a href="/" style={s.back}>← Siteye Dön</a>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <button style={s.tab(tab === 'list')} onClick={() => { setTab('list'); setEditId(null); setForm(EMPTY_FORM); }}>📋 Oyun Listesi</button>
        <button style={s.tab(tab === 'add')}  onClick={() => { setTab('add'); setEditId(null); setForm(EMPTY_FORM); }}>➕ Oyun Ekle</button>
      </div>

      {/* Toast */}
      {msg.text && <div style={s.toast(msg.ok)}>{msg.text}</div>}

      {/* ─── LIST ─── */}
      {tab === 'list' && (
        <div>
          <input
            style={s.search}
            placeholder="🔍 Oyun ara..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>{filtered.length} oyun</div>
          {filtered.map(o => (
            <div key={o.id} style={s.card}>
              <div style={s.dot(o.renk)} />
              <div style={s.name}>{o.isim}</div>
              {o.oda_id && <span style={s.odaBadge}>{odaIcon(o.oda_id)} {odaAdi(o.oda_id)}</span>}
              <span style={s.badge(o.is_active)}>{o.is_active ? 'Aktif' : 'Pasif'}</span>
              <div style={s.actions}>
                {o.url && (
                  <a href={o.url} target="_blank" rel="noreferrer" style={{ ...s.iconBtn('#8888cc'), textDecoration: 'none' }} title="Oyunu Aç">🔗</a>
                )}
                <button style={s.iconBtn('#f0a030')} onClick={() => startEdit(o)} title="Düzenle">✏️</button>
                <button style={s.iconBtn(o.is_active ? '#4cde8a' : '#f0a030')} onClick={() => toggleActive(o)} title={o.is_active ? 'Pasife Al' : 'Aktife Al'}>
                  {o.is_active ? '🟢' : '🔴'}
                </button>
                <button style={s.iconBtn('#f55')} onClick={() => handleDelete(o.id, o.isim)} title="Sil">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── ADD / EDIT ─── */}
      {tab === 'add' && (
        <div style={s.form}>
          <h2 style={{ margin: '0 0 20px', fontSize: 18, color: '#fff' }}>
            {editId ? '✏️ Oyunu Düzenle' : '➕ Yeni Oyun'}
          </h2>

          {/* Oyun Adı */}
          <label style={s.lbl}>OYUN ADI</label>
          <input style={s.inp} value={form.isim} placeholder="Örn: Elif'in Uzay Macerası"
            onChange={e => setForm(f => ({ ...f, isim: e.target.value }))} />

          {/* Renk */}
          <label style={s.lbl}>BALON RENGİ</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="color" value={form.renk} onChange={e => setForm(f => ({ ...f, renk: e.target.value }))}
              style={{ width: 48, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }} />
            <span style={{ fontSize: 13, color: '#888' }}>{form.renk}</span>
          </div>

          {/* Oda Seçimi */}
          <label style={s.lbl}>ODA SEÇİMİ</label>
          <div style={s.odaGrid}>
            {ODALAR.map(o => (
              <div key={o.id} style={s.odaCard(form.oda_id === o.id)} onClick={() => setForm(f => ({ ...f, oda_id: f.oda_id === o.id ? '' : o.id }))}>
                <div style={s.odaIcon}>{o.ikon}</div>
                <div style={s.odaName}>{o.isim}</div>
              </div>
            ))}
          </div>

          {/* Yükleme Tipi */}
          <label style={s.lbl}>YÜKLEME TİPİ</label>
          <div style={s.typeRow}>
            {[['file', '📁 Dosya'], ['paste', '📋 Yapıştır'], ['url', '🔗 Link']].map(([v, l]) => (
              <button key={v} style={s.typeBtn(form.inputType === v)} onClick={() => setForm(f => ({ ...f, inputType: v }))}>
                {l}
              </button>
            ))}
          </div>

          {/* HTML Input */}
          {form.inputType === 'file' && (
            <>
              <label style={s.lbl}>HTML DOSYASI</label>
              <input ref={fileRef} type="file" accept=".html" onChange={handleFile}
                style={{ ...s.inp, padding: 10, cursor: 'pointer' }} />
            </>
          )}
          {form.inputType === 'paste' && (
            <>
              <label style={s.lbl}>HTML KODU</label>
              <textarea style={s.textarea} value={form.htmlKodu} placeholder="<!DOCTYPE html>..."
                onChange={e => setForm(f => ({ ...f, htmlKodu: e.target.value }))} />
            </>
          )}
          {form.inputType === 'url' && (
            <>
              <label style={s.lbl}>OYUN LİNKİ (GitHub Pages, itch.io vb.)</label>
              <input style={s.inp} value={form.gameUrl} placeholder="https://..."
                onChange={e => setForm(f => ({ ...f, gameUrl: e.target.value }))} />
            </>
          )}

          {/* GitHub Upload */}
          {(form.inputType === 'file' || form.inputType === 'paste') && (
            <>
              <label style={s.lbl}>GITHUB KİŞİSEL ERİŞİM TOKENI</label>
              <div style={s.ghRow}>
                <input style={{ ...s.inp, flex: 1 }} type="password" value={form.ghToken || ''}
                  placeholder="ghp_xxxxxxxxxxxx"
                  onChange={e => setForm(f => ({ ...f, ghToken: e.target.value }))} />
                <button style={s.ghBtn} onClick={uploadToGitHub} disabled={uploading}>
                  {uploading ? '⏳ Yükleniyor...' : '🚀 GitHub\'a Yükle'}
                </button>
              </div>
              {form.gameUrl && (
                <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: '#0d2e1f', border: '1px solid #1a5c35' }}>
                  <span style={{ fontSize: 12, color: '#4cde8a' }}>✅ Link hazır: </span>
                  <a href={form.gameUrl} target="_blank" rel="noreferrer"
                    style={{ fontSize: 12, color: '#4cde8a', wordBreak: 'break-all' }}>{form.gameUrl}</a>
                </div>
              )}
            </>
          )}

          {/* Save */}
          <button style={s.btn('#f5576c')} onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Kaydediliyor...' : (editId ? '💾 Güncelle' : '💾 Kaydet')}
          </button>
          {editId && (
            <button style={{ ...s.btn('#333'), marginTop: 8 }} onClick={() => { setEditId(null); setForm(EMPTY_FORM); setTab('list'); }}>
              İptal
            </button>
          )}
        </div>
      )}
    </div>
  );
}
